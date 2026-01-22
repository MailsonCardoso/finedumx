<?php

namespace App\Http\Controllers;

use App\Models\Tuition;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MercadoPagoController extends Controller
{
    private $accessToken;

    public function __construct()
    {
        $this->accessToken = env('MERCADO_PAGO_ACCESS_TOKEN');
    }

    public function createPaymentLink(Tuition $tuition)
    {
        if (!$this->accessToken) {
            return response()->json(['error' => 'Mercado Pago Access Token not configured'], 500);
        }

        // Carrega o aluno se não estiver carregado
        $tuition->load('student');

        if (!$tuition->student) {
            return response()->json(['error' => 'Mensalidade sem aluno vinculado'], 400);
        }

        try {
            $response = Http::withToken($this->accessToken)
                ->post('https://api.mercadopago.com/checkout/preferences', [
                    'items' => [
                        [
                            'id' => (string) $tuition->id,
                            'title' => "Mensalidade " . $tuition->reference,
                            'quantity' => 1,
                            'currency_id' => 'BRL',
                            'unit_price' => (float) $tuition->amount
                        ]
                    ],
                    'payer' => [
                        'name' => $tuition->student->name,
                        'email' => 'student@email.com', // Idealmente ter o email do aluno
                    ],
                    'external_reference' => (string) $tuition->id,
                    'back_urls' => [
                        'success' => 'https://app.platformx.com.br/pagamento/sucesso',
                        'failure' => 'https://app.platformx.com.br/pagamento/falha',
                        'pending' => 'https://app.platformx.com.br/pagamento/pendente'
                    ],
                    'auto_return' => 'approved',
                ]);

            if ($response->failed()) {
                Log::error('Erro ao criar preferência MP', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'tuition_id' => $tuition->id,
                    'environment' => env('APP_ENV')
                ]);
                return response()->json([
                    'error' => 'Erro ao comunicar com Mercado Pago: ' . $response->body()
                ], 500);
            }

            $data = $response->json();
            Log::info('Preferência MP Criada com sucesso', ['id' => $data['id'] ?? 'N/A']);

            // Retorna o link (init_point para produção, sandbox_init_point para testes)
            // Vamos usar o init_point padrão, o MP decide baseado no token se é sandbox ou não
            $link = $data['init_point'];

            return response()->json(['url' => $link]);

        } catch (\Exception $e) {
            Log::error('Erro MP Controller', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Erro interno ao gerar link'], 500);
        }
    }

    public function handleWebhook(Request $request)
    {
        // Validação básica do Webhook
        $type = $request->input('type');

        if ($type === 'payment') {
            $paymentId = $request->input('data.id');

            // Consulta o pagamento no MP para garantir status
            $response = Http::withToken($this->accessToken)
                ->get("https://api.mercadopago.com/v1/payments/{$paymentId}");

            if ($response->successful()) {
                $paymentData = $response->json();

                $status = $paymentData['status'];
                $externalReference = $paymentData['external_reference']; // ID da Mensalidade

                if ($status === 'approved' && $externalReference) {
                    $tuition = Tuition::find($externalReference);

                    if ($tuition && $tuition->status !== 'pago') {
                        // 1. Atualiza Mensalidade
                        $tuition->update(['status' => 'pago']);

                        // 2. Cria Registro de Pagamento
                        Payment::create([
                            'student_id' => $tuition->student_id,
                            'tuition_id' => $tuition->id,
                            'type' => 'Mensalidade ' . $tuition->reference,
                            'method' => 'mercadopago_' . $paymentData['payment_method_id'],
                            'payment_date' => date('Y-m-d'), // Data da confirmação
                            'amount' => $paymentData['transaction_amount'],
                            'status' => 'confirmado'
                        ]);

                        Log::info("Pagamento aprovado via Webhook para Mensalidade ID: {$tuition->id}");
                    }
                }
            }
        }

        return response()->json(['status' => 'ok']);
    }
}

export interface Theme {
    name: string;
    primary: string;
    sidebar: string;
}

export function applyTheme(theme: Theme | string) {
    try {
        const t = typeof theme === 'string' ? JSON.parse(theme) : theme;
        if (!t || !t.primary || !t.sidebar) return;

        const root = document.documentElement;
        root.style.setProperty('--primary', t.primary);
        root.style.setProperty('--ring', t.primary);
        root.style.setProperty('--sidebar-background', t.sidebar);
        root.style.setProperty('--sidebar-foreground', '0 0% 100%');
        root.style.setProperty('--sidebar-primary', t.primary);
        root.style.setProperty('--sidebar-accent', `hsl(${t.sidebar} / 0.8)`);
        root.style.setProperty('--sidebar-accent-foreground', '0 0% 100%');

        localStorage.setItem('vem-cantar-theme', JSON.stringify(t));
    } catch (e) {
        console.error("Erro ao aplicar tema:", e);
    }
}

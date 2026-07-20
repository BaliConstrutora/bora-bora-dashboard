Não, não tenho como ver ou lembrar sua senha — ela fica criptografada no backend e nem eu nem você conseguimos recuperá-la. O caminho é **redefinir** a senha por email.

Hoje a tela `/auth` não tem esse fluxo. Proponho adicioná-lo:

## O que será feito

1. **`src/routes/auth.tsx`**
   - Adicionar link "Esqueci minha senha" abaixo do formulário de Entrar.
   - Ao clicar, alternar para um mini-formulário que pede o email e chama:
     ```ts
     supabase.auth.resetPasswordForEmail(email, {
       redirectTo: `${window.location.origin}/reset-password`,
     })
     ```
   - Toast de sucesso em pt-BR ("Enviamos um link para seu email").

2. **`src/routes/reset-password.tsx`** (nova rota pública)
   - Detecta `type=recovery` no hash da URL (Supabase abre a sessão de recuperação automaticamente).
   - Formulário com nova senha + confirmação (mínimo 6 caracteres).
   - Chama `supabase.auth.updateUser({ password })` e redireciona para `/auth` com toast de sucesso.
   - Sem gate de autenticação (fica fora de `_authenticated/`).

3. **Emails de autenticação**
   - Para o link chegar com identidade da Construtora Bali, rodar `email_domain--scaffold_auth_email_templates` (requer domínio de email configurado). Se você ainda não configurou, aparece o diálogo de setup — caso contrário, o Supabase usa o template padrão e o email chega mesmo assim.

Quer que eu inclua o passo 3 (email branded) ou só os passos 1 e 2 por enquanto?

# 🎵 Implementação OAuth 2.0 com Fluxo PKCE (Spotify)

Este projeto consiste em um trabalho de segurança computacional focado na implementação prática do fluxo de autenticação **OAuth 2.0 com PKCE (Proof Key for Code Exchange)**. A aplicação interage com a API do Spotify para realizar login, obter permissões e controlar a reprodução de música baseada em perfis de acesso.

## 🔗 Demo Online

A aplicação está hospedada no GitHub Pages e pode ser acessada através do link abaixo:

👉 **[Acessar Aplicação (Spotify OAuth PKCE)](https://gusgurgel.github.io/Spotify-OAuth2/)**

---

## 📂 Estrutura da Aplicação

A arquitetura da solução foi desenvolvida como uma Single Page Application (SPA) simplificada, dividida fundamentalmente em três arquivos principais que orquestram o fluxo de autenticação:

### 1. `index.html` (Ponto de Entrada)
É a tela inicial da aplicação. Aqui, o usuário seleciona seu perfil de acesso (Viewer ou Manager) e inicia o processo de login. Ao clicar no botão de autenticação, a aplicação gera o *code verifier* e o *code challenge* (específicos do PKCE) e redireciona o usuário para a página de autorização do Spotify.

### 2. `callback.html` (Troca de Token)
Este arquivo é o destino do redirecionamento após o usuário autorizar o acesso no Spotify.
* Ele captura o **Authorization Code** retornado na URL.
* Realiza a troca deste código (junto com o *code verifier* original) por um **Access Token** válido.
* Armazena o token e redireciona para o dashboard.

### 3. `dashboard.html` (Lógica de Negócio)

É onde a mágica acontece. Utilizando o token gerado, este arquivo contém a lógica para consumir os *endpoints* da API do Spotify. A interface se adapta baseada no perfil escolhido:
* **Perfil Viewer:** Apenas visualiza a música que está tocando no momento.
* **Perfil Manager:** Além de visualizar, possui controles de reprodução (Pausar e Retroceder/Pular música).

---

## ⚙️ Configuração e Segurança

Seguindo os requisitos da atividade, a segurança das credenciais foi priorizada no fluxo de deploy.

* **Injeção de Variáveis:** O `client_id` não está "hardcoded" diretamente no código fonte público. Ele é inserido através de um **GitHub Workflow** que popula um arquivo `env.js` durante o processo de build/deploy.

---

## ⚠️ Limitações e Acesso de Teste

Devido às políticas de segurança da API do Spotify, aplicações em **Modo de Desenvolvimento** possuem restrições de acesso (Cota de usuários). Para tornar a aplicação pública e acessível a qualquer conta do Spotify, seria necessário passar por um processo longo de verificação e aprovação de cota ("Quota Extension Request").

Portanto, **apenas e-mails cadastrados manualmente na dashboard de desenvolvedor podem acessar a aplicação**.

### 🔐 Credenciais para Teste
Para que você possa testar todas as funcionalidades (Login, Viewer e Manager) sem restrições, utilize a seguinte conta de teste pré-aprovada:

* **Email:** `testador1@gmail.com`
* **Senha:** `@testador1`

---

## 🛡️ Por que PKCE?

O **Proof Key for Code Exchange (PKCE)** é uma extensão vital para o protocolo OAuth 2.0, especialmente para aplicações públicas como esta (SPAs rodando no navegador ou apps mobile).



### A Importância:
Em aplicações puramente client-side, não é seguro armazenar um `client_secret`, pois qualquer pessoa pode inspecionar o código e roubá-lo. O PKCE resolve isso eliminando a necessidade do `client_secret`.

1.  A aplicação cria um segredo dinâmico (`code_verifier`) e envia uma versão hash dele (`code_challenge`) ao iniciar o login.
2.  Ao trocar o código de autorização pelo token, a aplicação envia o segredo original.
3.  O servidor valida se o segredo original corresponde ao hash enviado anteriormente.

Isso garante que, mesmo que um atacante intercepte o código de autorização (Authorization Code Interception Attack), ele não conseguirá trocá-lo pelo token de acesso, pois não possui o `code_verifier` original que foi gerado na memória do usuário legítimo.
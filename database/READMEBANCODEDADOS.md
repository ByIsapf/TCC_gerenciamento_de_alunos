# G.E.A — O que o Banco/Back precisa fazer

Oii gente :)

Fiz esse README com a ajuda do chat pra explicar o que o **Front já fez em cada página** e o que o **Back/Banco precisa fazer pra essas páginas funcionarem de verdade**.

Não precisa copiar exatamente os nomes que eu coloquei, é só pra deixar claro o que cada parte precisa fazer.

---

# 1. LOGIN DO ALUNO

📄 `index.html`

Essa é a página onde o aluno vai entrar no sistema.

### O que tem no Front:

* RA
* Senha
* Código do QR Code

### O que o Back precisa fazer:

Quando o aluno colocar os dados, o sistema precisa verificar:

RA → existe no banco?
Senha → está correta para esse RA?
Código do QR → é válido?


Se estiver tudo certo:

Aluno → pode entrar no sistema

Se alguma informação estiver errada:

Aluno → não pode entrar


O Front só vai mandar essas informações. Quem vai conferir de verdade é o Back.

---

# 2. LOGIN DA SECRETARIA

📄 `secretaria/login.html`

Essa é a página de login da secretaria.

### O que tem no Front:

* E-mail
* Senha

### O que o Back precisa fazer:

Quando a pessoa clicar em **Entrar**, precisa conferir no banco:

E-mail → existe?
Senha → está correta?


Se estiver certo:

Login correto
↓
Pode entrar no Dashboard


Se estiver errado:


Login incorreto
↓
Não pode entrar

⚠️ Atualmente o Front só está levando a pessoa para o Dashboard. Isso é provisório. Depois o Back precisa fazer a validação de verdade.

---

# 3. DASHBOARD DA SECRETARIA

📄 `gestao/dashboard.html`

Essa é a primeira página que aparece depois que a secretaria entra.

No momento ela tem algumas informações que estão colocadas **só como exemplo**.

### 👤 Alunos cadastrados

No Dashboard aparece a quantidade total de alunos.

O Back precisa conseguir:


Contar quantos alunos estão cadastrados
↓
Mandar esse número para o Front


Exemplo:
842 alunos

Esse 842 que está agora é só exemplo.
---

### 🏫 Turmas

Também aparece a quantidade de turmas cadastradas.

O Back precisa:

Contar quantas turmas existem
↓
Mandar o número para o Front


---

### 📅 Frequência de hoje

No Dashboard aparece:

Presentes
Ausentes


Depois também vamos trabalhar com **atrasados**.

O Back precisa pegar a frequência do dia atual e conseguir informar:

Quantos presentes?
Quantos ausentes?
Quantos atrasados?

---

Os valores e informações que estão aparecendo no Front agora podem ser fictícios. Eles serão substituídos pelos dados reais quando o Back estiver conectado.

Conforme novas páginas forem sendo feitas, vamos adicionando aqui o que cada uma vai precisar do Banco/Back.

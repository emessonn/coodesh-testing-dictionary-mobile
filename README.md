# Dictionary App

Aplicativo mobile desenvolvido em React Native e TypeScript para explorar vocabulário em inglês, consultar definições, fonética e pronúncia pela [Free Dictionary API](https://dictionaryapi.dev/), com suporte a cache local, histórico e favoritos por usuário.

---

## Sobre o desenvolvimento e decisões técnicas

Antes de iniciar a codificação, fiz uma análise do comportamento da Free Dictionary API e da estrutura do arquivo [`words_dictionary.json`](https://github.com/dwyl/english-words/blob/master/words_dictionary.json) sugerido no desafio para mapear os principais gargalos e casos de borda.

### 1. Listagem de palavras e paginação

A API não possui um endpoint que retorne uma lista paginada de palavras; ela apenas consulta um termo específico por vez (`/api/v2/entries/en/{word}`). Já o arquivo `words_dictionary.json` é um objeto JSON grande no formato `{ "word": 1 }`.

Carregar e renderizar milhares de chaves direto na árvore do React causaria lentidão na abertura do app e engasgos na rolagem. Para resolver isso, mantive a base de palavras indexada em memória a partir do JSON e criei uma paginação sob demanda (`GetWordsPageUseCase`) que entrega fatias de 36 palavras por página (múltiplo exato das 3 colunas do layout). Na interface, a `FlatList` consome essas páginas via `onEndReached`, garantindo rolagem infinita fluida mesmo com filtro de busca ativo.

### 2. Quirks da API e tratamento de chamadas assíncronas

Testando os retornos da Free Dictionary API para diferentes palavras, notei alguns pontos que precisavam de normalização antes de chegar na tela:

- O campo `phonetic` na raiz do objeto nem sempre vem preenchido; muitas vezes a transcrição fonética está apenas dentro de um dos itens do array `phonetics`.
- No array `phonetics`, vários registros trazem `audio: ""` (string vazia) e alguns links de áudio antigos vêm sem protocolo (`//ssl.gstatic.com/...`), o que falha no player se não for normalizado para `https://`.
- Como o modal de detalhes possui os botões **Voltar** e **Próximo**, o usuário pode avançar rapidamente por várias palavras seguidas. Para evitar condições de corrida (uma resposta antiga sobrescrever a palavra atual) ou travamentos em conexões instáveis, o cliente HTTP (`FreeDictionaryApiClient`) utiliza `AbortController` com timeout de 10 segundos. Sempre que o usuário troca de palavra ou fecha o modal, a requisição em andamento é cancelada.

### 3. Estratégia de cache local

Para evitar chamadas repetidas à API quando o usuário revisita uma palavra (seja pela aba de histórico, favoritos ou navegando pelos botões de anterior/próximo), implementei uma camada de cache persistente (`CacheRepositoryImpl`).

Ao abrir uma palavra:

1. O caso de uso registra o termo no histórico do usuário atual.
2. Verifica se a definição já existe no cache local. Se existir, retorna imediatamente sem usar a rede.
3. Caso contrário, busca na Free Dictionary API, normaliza o payload, salva no cache e exibe em tela.

Na parte superior da tela de detalhes, adicionei um indicador discreto (`CACHE` ou `API`) para facilitar a visualização de quando o dado veio da memória/storage ou da rede.

### 4. Pronúncia e fallback de áudio

Como nem todas as palavras da API possuem arquivo `.mp3` disponível, o serviço de áudio (`PronunciationAudioService`) prioriza o link oficial retornado em `phonetics` e, quando nenhum áudio está disponível na resposta, recorre automaticamente ao endpoint de síntese de voz da [ResponsiveVoice](https://responsivevoice.org/api) (`en-US`), atualizando a barra de progresso durante a reprodução.

### 5. Arquitetura, Injeção de Dependência e Autenticação

Organizei o código separando responsabilidades em quatro camadas (`domain`, `data`, `infra` e `presentation`) conectadas por um container simples de Injeção de Dependência (`src/di/container.ts`). Além de manter os componentes React limpos (consumindo apenas casos de uso e contextos), isso permitiu testar toda a regra de negócio e a própria árvore de telas injetando um banco em memória nos testes, sem depender de mocks complexos de módulos nativos.

Para o controle de sessão, implementei autenticação local por usuário e senha (`AuthRepositoryImpl`). Tanto os favoritos quanto o histórico de visualização são gravados no banco local vinculados ao `userId` da sessão ativa, permitindo alternar entre contas sem misturar os dados de cada usuário.

---

## Tecnologias utilizadas

- **Linguagem:** TypeScript
- **Framework:** React Native 0.88 (React Native CLI)
- **Gerenciamento de Estado:** React Context API + Hooks customizados
- **Persistência e Cache:** `@react-native-async-storage/async-storage` (encapsulado com cache em memória write-through em `LocalDatabase`)
- **Injeção de Dependência:** Container IoC próprio (`DIContainer`)
- **Estilização e UI:** `react-native-paper` (Material Design 3) + `StyleSheet` seguindo a estrutura do wireframe proposto
- **Testes:** Jest + `react-test-renderer`

---

## Funcionalidades implementadas

- **Autenticação de usuário:** Cadastro e login com usuário e senha (com opção de acesso rápido para testes).
- **Lista de palavras (`Word list`):** Grade em 3 colunas com rolagem infinita e busca por texto.
- **Histórico (`History`):** Registro automático das palavras abertas pelo usuário logado.
- **Favoritos (`Favorites`):** Adição e remoção de palavras favoritas, refletidas na grade e no modal de detalhes.
- **Detalhes da palavra:** Exibição do termo, transcrição fonética, player de pronúncia com barra de progresso, listagem de significados (`Meanings`), exemplos de uso e navegação direta entre palavras (**Voltar** / **Próximo**).
- **Cache de requisições:** Persistência automática dos resultados consultados na API.

---

## Estrutura do projeto

```text
src/
├── assets/
│   ├── words_dictionary.json       # Dicionário de palavras em inglês
│   └── defaultDefinitions.ts       # Definições base para contingência offline
├── di/
│   └── container.ts                # Registro e resolução de dependências
├── domain/
│   ├── entities/                   # Tipagens e modelos de domínio
│   ├── repositories/               # Interfaces dos repositórios e serviços
│   └── usecases/                   # Casos de uso da aplicação
├── data/
│   └── repositories/               # Implementações de cache, dicionário, auth e favoritos
├── infra/
│   ├── audio/                      # Serviço de reprodução de pronúncia e fallback TTS
│   ├── http/                       # Cliente HTTP para a Free Dictionary API
│   └── storage/                    # Abstração de persistência sobre o AsyncStorage
└── presentation/
    ├── components/                 # Abas superiores, células da grade e player de áudio
    ├── context/                    # Contextos de autenticação, dicionário e DI
    ├── screens/                    # Telas de Login, Home e Modal de detalhes
    └── theme/                      # Paleta de cores e espaçamentos
```

---

## Como instalar e rodar o projeto

### Pré-requisitos

- **Node.js** 22 ou superior
- Ambiente de desenvolvimento **React Native CLI** configurado ([documentação oficial](https://reactnative.dev/docs/set-up-your-environment)):
  - **Android:** JDK 17+, Android Studio, Android SDK e um emulador ou dispositivo físico conectado.
  - **iOS (macOS):** Xcode e CocoaPods instalados.

### Passo a passo

1. Clone o repositório e instale as dependências:

```bash
git clone <url-do-repositorio>
cd coodesh-testing-dictionary-mobile
npm install
```

2. Caso vá executar no **iOS**, instale os pods nativos:

```bash
cd ios && bundle install && bundle exec pod install && cd ..
```

3. Inicie o Metro Bundler:

```bash
npm start
```

4. Em outro terminal, execute o aplicativo na plataforma desejada:

```bash
# Para rodar no Android
npm run android

# Para rodar no iOS
npm run ios
```

### Usando o app

Ao abrir o aplicativo, você verá a tela de acesso. Você pode criar uma conta nova clicando em **"Criar uma nova conta"** ou entrar diretamente com a conta pré-cadastrada clicando no botão **"Acesso rápido (admin / 123456)"**.

---

## Executando os testes

O projeto possui testes unitários para os casos de uso, cache, autenticação, container de injeção de dependência e cliente da API, além de teste de integração do fluxo principal da interface.

Para rodar os testes:

```bash
npm test
```

Para validar a checagem de tipos do TypeScript:

```bash
npx tsc --noEmit
```

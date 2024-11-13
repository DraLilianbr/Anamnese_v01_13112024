# Sistema de Avaliação por Vídeo - Documentação Técnica

## 1. Estrutura do Projeto

### 1.1 Componentes Principais

#### `src/pages/home.tsx`
```typescript
// Página inicial que mostra:
// 1. Vídeo de introdução (configurável)
// 2. Formulário de cadastro do paciente
// 3. Seleção de questionário (se houver múltiplos)

// Principais funcionalidades:
const [showRegistration, setShowRegistration] = useState(false); // Controla exibição do formulário
const [videoEnded, setVideoEnded] = useState(false);            // Controla se vídeo terminou
const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<any>(null); // Questionário atual

// Fluxo:
1. Carrega configurações do sistema (vídeos padrão)
2. Carrega questionário específico ou lista de questionários
3. Mostra vídeo de introdução
4. Após vídeo, mostra formulário de cadastro
5. Após cadastro, redireciona para avaliação
```

#### `src/pages/assessment.tsx`
```typescript
// Página de avaliação que mostra:
// 1. Vídeo da pergunta atual
// 2. Campo de resposta
// 3. Controles de navegação

// Principais funcionalidades:
const [currentStep, setCurrentStep] = useState(-1);  // Pergunta atual
const [answers, setAnswers] = useState({});          // Respostas do paciente
const [videoEnded, setVideoEnded] = useState(false); // Controle do vídeo

// Fluxo:
1. Carrega questionário e configurações
2. Mostra pergunta atual com vídeo
3. Habilita resposta após vídeo terminar
4. Salva resposta e avança para próxima pergunta
5. No final, mostra vídeo de agradecimento
```

### 1.2 Componentes de UI

#### `src/components/youtube-embed.tsx`
```typescript
// Player de vídeo personalizado com:
// 1. Controle de autoplay
// 2. Detecção de fim do vídeo
// 3. Loading state
// 4. Tratamento de erros

interface YouTubeEmbedProps {
  videoId: string;              // ID do vídeo do YouTube
  onEnded?: () => void;        // Callback quando vídeo termina
  autoplay?: boolean;          // Controle de autoplay
}

// Funcionalidades:
1. Inicializa API do YouTube
2. Gerencia ciclo de vida do player
3. Monitora estados do vídeo
4. Limpa recursos ao desmontar
```

#### `src/components/question-form.tsx`
```typescript
// Formulário de resposta com:
// 1. Contador de palavras
// 2. Validação de resposta
// 3. Estado de bloqueio
// 4. Feedback visual

interface QuestionFormProps {
  question: {
    id: string;
    title: string;
    description: string;
    videoId: string;
  };
  currentAnswer?: string;      // Resposta atual
  onAnswer: (answer: string) => void;  // Callback de resposta
  onComplete: () => void;      // Callback de conclusão
  isLocked?: boolean;          // Estado de bloqueio
}

// Validações:
1. Mínimo de 20 palavras
2. Vídeo deve ser assistido
3. Resposta não pode ser vazia
```

### 1.3 Gerenciamento de Estado

#### `src/lib/auth.ts`
```typescript
// Gerenciamento de autenticação usando Zustand
// Persiste estado no localStorage

interface AuthState {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

// Funcionalidades:
1. Login/logout
2. Persistência de sessão
3. Proteção de rotas
```

#### `src/lib/branding.ts`
```typescript
// Gerenciamento de marca/identidade visual
// Persiste configurações no localStorage

interface BrandingState {
  companyName: string;
  logoUrl: string;
  updateBranding: (name: string, logo: string) => void;
}

// Funcionalidades:
1. Atualização de logo
2. Atualização de nome
3. Persistência de configurações
```

### 1.4 Integração Firebase

#### `src/lib/firebase.ts`
```typescript
// Configuração e inicialização do Firebase

// Serviços utilizados:
1. Firestore (banco de dados)
2. Auth (autenticação)
3. Storage (armazenamento de arquivos)

// Coleções principais:
1. questionnaires: Questionários criados
2. patients: Dados dos pacientes
3. responses: Respostas das avaliações
4. system_settings: Configurações do sistema
```

### 1.5 Utilitários

#### `src/lib/youtube.ts`
```typescript
// Integração com API do YouTube
// Busca informações de vídeos

interface VideoInfo {
  title: string;
  description: string;
  thumbnail: string;
}

// Funcionalidades:
1. Busca metadados do vídeo
2. Validação de IDs
3. Tratamento de erros
```

#### `src/lib/image.ts`
```typescript
// Processamento de imagens
// Redimensionamento e otimização

// Funcionalidades:
1. Redimensiona imagens mantendo proporção
2. Converte para formato otimizado
3. Limita tamanho máximo
```

## 2. Fluxos de Dados

### 2.1 Criação de Questionário
```typescript
1. Admin acessa dashboard
2. Seleciona vídeos predefinidos
3. Define ordem das perguntas
4. Sistema salva no Firestore
5. Gera link único para compartilhamento
```

### 2.2 Resposta do Paciente
```typescript
1. Paciente acessa link
2. Assiste vídeo introdutório
3. Preenche cadastro
4. Sistema cria registro de resposta
5. Paciente responde perguntas sequencialmente
6. Sistema salva cada resposta
7. Mostra vídeo de agradecimento
```

### 2.3 Visualização de Respostas
```typescript
1. Admin acessa dashboard
2. Seleciona questionário
3. Sistema busca respostas relacionadas
4. Exibe lista de pacientes e status
5. Permite visualização detalhada
```

## 3. Segurança e Validações

### 3.1 Autenticação
```typescript
1. Login administrativo
2. Proteção de rotas sensíveis
3. Validação de sessão
```

### 3.2 Validação de Dados
```typescript
1. Validação de formulários com Zod
2. Validação de respostas
3. Sanitização de inputs
```

## 4. Otimizações

### 4.1 Performance
```typescript
1. Lazy loading de componentes
2. Caching de dados do YouTube
3. Otimização de imagens
```

### 4.2 UX
```typescript
1. Feedback visual de ações
2. Estados de loading
3. Tratamento de erros
4. Mensagens informativas
```
## Guia de Componentes do Sistema

### 1. YouTubeEmbed (`youtube-embed.tsx`)
```typescript
/**
 * Componente responsável por renderizar e controlar o player de vídeo do YouTube
 * 
 * Funcionalidades:
 * - Carrega API do YouTube automaticamente
 * - Controla estados de loading e erro
 * - Gerencia ciclo de vida do player
 * - Detecta fim do vídeo
 * - Suporta autoplay configurável
 * 
 * Props:
 * - videoId: string (ID do vídeo do YouTube)
 * - onEnded?: () => void (Callback quando vídeo termina)
 * - autoplay?: boolean (Controle de autoplay)
 * 
 * Estados:
 * - isLoading: Indica carregamento do player
 * - error: Armazena mensagens de erro
 * 
 * Exemplo de uso:
 * <YouTubeEmbed 
 *   videoId="abc123" 
 *   onEnded={() => console.log('Vídeo terminou')}
 *   autoplay={true}
 * />
 */
```

### 2. QuestionForm (`question-form.tsx`)
```typescript
/**
 * Componente de formulário para resposta de questões
 * 
 * Funcionalidades:
 * - Exibe vídeo da questão
 * - Controla campo de resposta
 * - Valida quantidade mínima de palavras
 * - Bloqueia avanço até requisitos serem cumpridos
 * - Suporta modo bloqueado para respostas já dadas
 * 
 * Props:
 * - question: { id, title, description, videoId }
 * - currentAnswer?: string
 * - onAnswer: (answer: string) => void
 * - onComplete: () => void
 * - isLocked?: boolean
 * 
 * Estados:
 * - answer: Resposta atual
 * - videoEnded: Status do vídeo
 * - wordCount: Contador de palavras
 * 
 * Validações:
 * - Mínimo de 20 palavras
 * - Vídeo deve ser assistido
 * - Campo não pode estar vazio
 */
```

### 3. CreateQuestionnaireModal (`create-questionnaire-modal.tsx`)
```typescript
/**
 * Modal para criação de novos questionários
 * 
 * Funcionalidades:
 * - Seleção de vídeos predefinidos
 * - Ordenação de questões
 * - Preview de vídeos selecionados
 * - Validação de formulário
 * - Impede seleção duplicada de vídeos
 * 
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onSubmit: (data: any) => void
 * 
 * Estados:
 * - title: Título do questionário
 * - description: Descrição
 * - questions: Array de questões
 * - availableVideos: Vídeos disponíveis
 * - isLoading: Estado de carregamento
 * 
 * Fluxo:
 * 1. Carrega informações dos vídeos
 * 2. Permite seleção e ordenação
 * 3. Valida dados
 * 4. Submete questionário
 */
```

### 4. EditQuestionnaireModal (`edit-questionnaire-modal.tsx`)
```typescript
/**
 * Modal para edição de questionários existentes
 * 
 * Funcionalidades:
 * - Edição de título e descrição
 * - Reordenação de questões
 * - Adição/remoção de questões
 * - Preview de vídeos
 * 
 * Props:
 * - open: boolean
 * - questionnaire: QuestionnaireData
 * - onClose: () => void
 * - onSubmit: (data: any) => void
 * 
 * Estados:
 * - formData: Dados do formulário
 * - availableVideos: Vídeos disponíveis
 * - isLoading: Estado de carregamento
 * 
 * Validações:
 * - Campos obrigatórios
 * - Ordem das questões
 * - Vídeos únicos
 */
```

### 5. SystemSettingsModal (`system-settings-modal.tsx`)
```typescript
/**
 * Modal de configurações do sistema
 * 
 * Funcionalidades:
 * - Configuração de vídeos padrão
 * - Controle de exibição de vídeos
 * - Personalização de mensagens
 * 
 * Props:
 * - open: boolean
 * - onClose: () => void
 * 
 * Estados:
 * - settings: Configurações atuais
 * - isSaving: Estado de salvamento
 * 
 * Configurações:
 * - Vídeo de introdução
 * - Vídeo de agradecimento
 * - Exibição de vídeos
 * - Textos do sistema
 */
```

### 6. BrandingModal (`branding-modal.tsx`)
```typescript
/**
 * Modal de configuração da marca
 * 
 * Funcionalidades:
 * - Upload de logo
 * - Redimensionamento de imagens
 * - Configuração de nome da empresa
 * 
 * Props:
 * - open: boolean
 * - onClose: () => void
 * 
 * Estados:
 * - name: Nome da empresa
 * - logo: URL da logo
 * - isUploading: Estado de upload
 * 
 * Processamento:
 * - Redimensiona imagens grandes
 * - Converte para formato otimizado
 * - Valida tipos de arquivo
 */
```

### 7. Navbar (`navbar.tsx`)
```typescript
/**
 * Barra de navegação principal
 * 
 * Funcionalidades:
 * - Links de navegação
 * - Estado de autenticação
 * - Exibição de marca
 * 
 * Props:
 * - Nenhuma (usa contexto global)
 * 
 * Estados:
 * - isAuthenticated: Estado de login
 * - branding: Dados da marca
 * 
 * Features:
 * - Responsivo
 * - Navegação condicional
 * - Logout
 */
```

### 8. Layout (`layout.tsx`)
```typescript
/**
 * Componente de layout principal
 * 
 * Funcionalidades:
 * - Estrutura básica da página
 * - Container para rotas
 * - Navbar fixo
 * 
 * Props:
 * - children: ReactNode
 * 
 * Estrutura:
 * - Navbar no topo
 * - Conteúdo principal
 * - Container responsivo
 */
```

### 9. NotFound (`not-found.tsx`)
```typescript
/**
 * Página 404
 * 
 * Funcionalidades:
 * - Mensagem de erro
 * - Link para página inicial
 * 
 * Props:
 * - Nenhuma
 * 
 * Features:
 * - Design amigável
 * - Redirecionamento fácil
 */
```

### 10. ResponsesView (`responses-view.tsx`)
```typescript
/**
 * Visualização de respostas
 * 
 * Funcionalidades:
 * - Lista respostas do paciente
 * - Mostra detalhes da avaliação
 * - Permite anotações
 * 
 * Props:
 * - responseId: string
 * 
 * Estados:
 * - response: Dados da resposta
 * - questionnaire: Questionário relacionado
 * - patient: Dados do paciente
 * 
 * Features:
 * - Histórico de respostas
 * - Evolução do paciente
 * - Exportação de dados
 */
```

### Boas Práticas de Uso

1. **Composição de Componentes**
   - Use componentes menores para construir funcionalidades maiores
   - Mantenha responsabilidades bem definidas
   - Evite duplicação de código

2. **Gerenciamento de Estado**
   - Use estados locais para dados específicos do componente
   - Use Zustand para estado global
   - Mantenha estados mínimos necessários

3. **Performance**
   - Implemente memoização quando necessário
   - Use lazy loading para componentes pesados
   - Otimize re-renderizações

4. **Acessibilidade**
   - Mantenha estrutura semântica
   - Implemente navegação por teclado
   - Forneça textos alternativos

5. **Responsividade**
   - Use classes Tailwind responsivas
   - Teste em diferentes dispositivos
   - Mantenha layout consistente
import type { Priority, Status, Ticket } from '../types';
import { addComment, changeStatus, createTicket } from '../lib/tickets';

interface Seed {
  id: number;
  title: string;
  client: string;
  priority: Priority;
  status: Status;
  owner: string;
  description: string;
  daysAgo: number;
  comment?: string;
}

// Dados fictícios. Nomes de empresas e pessoas são inventados.
const SEEDS: Seed[] = [
  { id: 1042, title: 'Erro ao gerar relatório financeiro', client: 'Aurora Tech', priority: 'Alta', status: 'Aberto', owner: 'Mariana Costa', description: 'Erro intermitente ao exportar o relatório em PDF.', daysAgo: 0, comment: 'Cliente enviou print do erro. Acontece só com períodos acima de 90 dias.' },
  { id: 1041, title: 'Dúvida sobre permissões de acesso', client: 'Grupo Solaris', priority: 'Baixa', status: 'Resolvido', owner: 'Pedro Lima', description: 'Orientação sobre perfis de usuário.', daysAgo: 1 },
  { id: 1040, title: 'Integração não sincroniza pedidos', client: 'Nova Comércio', priority: 'Alta', status: 'Em andamento', owner: 'Ana Souza', description: 'Pedidos do marketplace não chegam desde ontem.', daysAgo: 1, comment: 'Token da integração expirou. Aguardando o cliente gerar um novo.' },
  { id: 1039, title: 'Atualização de dados cadastrais', client: 'Ponto Norte', priority: 'Média', status: 'Aberto', owner: 'Lucas Rocha', description: 'Solicitação de alteração de endereço e telefone.', daysAgo: 2 },
  { id: 1038, title: 'Lentidão no painel de vendas', client: 'Atlas Digital', priority: 'Média', status: 'Resolvido', owner: 'Mariana Costa', description: 'O painel demora mais de 10 segundos para carregar.', daysAgo: 3, comment: 'Índice criado na tabela de vendas. O tempo caiu para 1 segundo.' },
  { id: 1037, title: 'Ajuste no fluxo de cobrança', client: 'Horizonte Serviços', priority: 'Média', status: 'Em andamento', owner: 'Pedro Lima', description: 'Revisão do processo de cobrança recorrente.', daysAgo: 3 },
  { id: 1036, title: 'Nota fiscal com valor divergente', client: 'Ponto Norte', priority: 'Alta', status: 'Resolvido', owner: 'Ana Souza', description: 'Conferir o cálculo de impostos na emissão.', daysAgo: 4 },
  { id: 1035, title: 'Usuário bloqueado após troca de senha', client: 'Atlas Digital', priority: 'Média', status: 'Resolvido', owner: 'Lucas Rocha', description: 'Desbloqueio e orientação sobre senha forte.', daysAgo: 5 },
  { id: 1034, title: 'Novo relatório de estoque', client: 'Nova Comércio', priority: 'Baixa', status: 'Aberto', owner: '', description: 'Avaliar a viabilidade com o time de produto.', daysAgo: 5 },
  { id: 1033, title: 'Impressora fiscal não comunica', client: 'Horizonte Serviços', priority: 'Alta', status: 'Resolvido', owner: 'Pedro Lima', description: 'Driver reinstalado e porta reconfigurada.', daysAgo: 6 },
];

const HOUR = 3_600_000;

// As datas são relativas a hoje, para o gráfico dos últimos 7 dias sempre ter o que mostrar.
export function makeExamples(now = Date.now()): Ticket[] {
  return SEEDS.map((seed, index) => {
    const created = now - seed.daysAgo * 24 * HOUR - (2 + (index % 4)) * HOUR;
    const iso = (time: number) => new Date(Math.min(time, now)).toISOString();
    const { id, title, client, priority, owner, description } = seed;
    let ticket = createTicket(id, { title, client, priority, status: 'Aberto', owner, description }, iso(created));
    if (seed.status !== 'Aberto') ticket = changeStatus(ticket, 'Em andamento', iso(created + HOUR));
    if (seed.comment) ticket = addComment(ticket, seed.comment, iso(created + 2 * HOUR));
    if (seed.status === 'Resolvido') ticket = changeStatus(ticket, 'Resolvido', iso(created + 20 * HOUR));
    return ticket;
  });
}

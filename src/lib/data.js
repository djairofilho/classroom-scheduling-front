export const appUser = {
  name: 'Marina Silva',
  role: 'Professora',
  department: 'Arquitetura e Cidade',
}

export const metrics = [
  { label: 'Reservas ativas', value: '12', icon: 'calendar', tone: 'primary' },
  { label: 'Espacos disponiveis', value: '45', icon: 'building', tone: 'secondary' },
  { label: 'Notificacoes', value: '3', icon: 'bell', tone: 'tertiary' },
  { label: 'Predios ativos', value: '8', icon: 'layers', tone: 'neutral' },
]

export const spaces = [
  {
    id: 'A101',
    name: 'Sala A101',
    building: 'Predio Alfa',
    floor: '1 andar',
    type: 'Aula',
    capacity: 40,
    status: 'Disponivel',
    statusTone: 'success',
    description: 'Sala para aulas expositivas com projetor, quadro digital e mesa para docente.',
    features: ['Projetor 4K', 'Quadro digital', 'Acessibilidade', 'Ar-condicionado'],
    nextEvents: [
      { title: 'Calculo II', owner: 'Prof. Carlos Silva', date: '24 Nov', time: '08:00 - 10:00' },
      { title: 'Reuniao de colegiado', owner: 'Coordenacao', date: '26 Nov', time: '14:00 - 16:00' },
    ],
    weeklySchedule: [
      ['Livre', 'Reserva', 'Livre', 'Reserva', 'Livre', 'Livre'],
      ['Livre', 'Livre', 'Manutencao', 'Livre', 'Evento', 'Livre'],
    ],
  },
  {
    id: 'B204',
    name: 'Sala B204',
    building: 'Predio Beta',
    floor: '2 andar',
    type: 'Reuniao',
    capacity: 12,
    status: 'Disponivel',
    statusTone: 'success',
    description: 'Sala compacta para reunioes de equipes academicas e orientacoes individuais.',
    features: ['TV 55"', 'Videochamada', 'Isolamento acustico'],
    nextEvents: [
      { title: 'Comite de pesquisa', owner: 'Nucleo de Inovacao', date: '25 Nov', time: '09:00 - 11:00' },
    ],
    weeklySchedule: [
      ['Livre', 'Livre', 'Livre', 'Reserva', 'Livre', 'Livre'],
      ['Livre', 'Evento', 'Livre', 'Livre', 'Livre', 'Livre'],
    ],
  },
  {
    id: 'AUD',
    name: 'Auditorio Central',
    building: 'Hub',
    floor: 'Terreo',
    type: 'Auditorio',
    capacity: 180,
    status: 'Indisponivel',
    statusTone: 'danger',
    description: 'Espaco para eventos institucionais de grande porte. Em manutencao preventiva.',
    features: ['Palco', 'Som ambiente', 'Streaming', 'Acessibilidade'],
    maintenanceReason: 'Manutencao de audio e iluminacao',
    nextEvents: [
      { title: 'Forum de extensao', owner: 'Diretoria', date: '01 Dez', time: '18:00 - 20:30' },
    ],
    weeklySchedule: [
      ['Livre', 'Livre', 'Livre', 'Livre', 'Livre', 'Livre'],
      ['Livre', 'Livre', 'Livre', 'Livre', 'Livre', 'Livre'],
    ],
  },
]

export const recentNotifications = [
  {
    id: 1,
    title: 'Mudanca de status',
    body: 'Sua reserva para a Sala B205 foi confirmada pela administracao.',
    time: 'Ha 2 horas',
    tone: 'primary',
  },
  {
    id: 2,
    title: 'Manutencao programada',
    body: 'O Predio Beta ficara sem energia no proximo sabado.',
    time: 'Ontem',
    tone: 'warning',
  },
  {
    id: 3,
    title: 'Novos laboratorios',
    body: 'Tres novos laboratorios de informatica estao disponiveis para reserva.',
    time: '2 dias atras',
    tone: 'secondary',
  },
]

export const bookings = [
  {
    id: '#RES-001',
    space: 'Laboratorio de Informatica 3',
    building: 'Predio B - Exatas',
    date: '15 Out 2023',
    time: '14:00 - 16:00',
    reason: 'Aula pratica de IA',
    status: 'Ativa',
  },
  {
    id: '#RES-042',
    space: 'Auditorio Principal',
    building: 'Predio Central',
    date: '12 Out 2023',
    time: '09:00 - 12:00',
    reason: 'Palestra Magma',
    status: 'Cancelada',
  },
  {
    id: '#RES-088',
    space: 'Sala de Reuniao 2',
    building: 'Predio Administrativo',
    date: '20 Out 2023',
    time: '10:00 - 11:30',
    reason: 'Reuniao de colegiado',
    status: 'Ativa',
  },
]

export const adminBuildings = [
  { name: 'Predio Alfa', rooms: 18, manager: 'Infra Campus Norte', occupancy: '82%', status: 'Operando' },
  { name: 'Predio Beta', rooms: 12, manager: 'Infra Campus Norte', occupancy: '61%', status: 'Atencao' },
  { name: 'Hub de Inovacao', rooms: 9, manager: 'Operacoes Academicas', occupancy: '75%', status: 'Operando' },
]

export const adminSpaces = [
  { name: 'Sala A101', type: 'Aula', building: 'Predio Alfa', capacity: 40, status: 'Disponivel' },
  { name: 'Lab Maker 2', type: 'Laboratorio', building: 'Hub de Inovacao', capacity: 24, status: 'Revisao' },
  { name: 'Auditorio Central', type: 'Auditorio', building: 'Hub', capacity: 180, status: 'Manutencao' },
]

export const adminUsers = [
  { name: 'Marina Silva', role: 'Professora', email: 'marina.silva@insper.edu.br', requests: 12, status: 'Ativo' },
  { name: 'Diego Ramos', role: 'Coordenacao', email: 'diego.ramos@insper.edu.br', requests: 8, status: 'Aprovador' },
  { name: 'Lucia Prado', role: 'Infraestrutura', email: 'lucia.prado@insper.edu.br', requests: 5, status: 'Admin' },
]

export const apiStatus = [
  { name: 'Auth API', latency: '42 ms', status: 'Saudavel' },
  { name: 'Reservations API', latency: '64 ms', status: 'Saudavel' },
  { name: 'Catalog API', latency: '127 ms', status: 'Atencao' },
]

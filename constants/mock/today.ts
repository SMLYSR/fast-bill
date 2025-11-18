export type TodayItem = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  location?: string;
  note?: string;
  time: string;
  icon?: string;
};

export const todaySummary = {
  income: 5250,
  expense: 1084.5,
};

export const todayItems: TodayItem[] = [
  { id: 't1', type: 'expense', amount: 35, category: '夜宵', location: '烧烤摊', note: '加班后宵夜', time: '21:30', icon: '🍢' },
  { id: 't2', type: 'expense', amount: 150, category: '健身', location: '健身房', note: '月卡续费', time: '20:45', icon: '🏃' },
  { id: 't3', type: 'expense', amount: 150, category: '购物', location: '超市', note: '日用品采购', time: '20:15', icon: '🛒' },
  { id: 't4', type: 'expense', amount: 88, category: '晚餐', location: '披萨店', time: '19:30', icon: '🍕' },
  { id: 't5', type: 'expense', amount: 12, category: '交通', location: '地铁', time: '19:00', icon: '🚇' },
  { id: 't6', type: 'expense', amount: 25, category: '零食', location: '电影院', time: '17:45', icon: '🍿' },
  { id: 't7', type: 'income', amount: 50, category: '红包', note: '朋友还钱', time: '17:00', icon: '🧧' },
  { id: 't8', type: 'expense', amount: 22, category: '饮品', location: '奶茶店', time: '15:45', icon: '🧋' },
  { id: 't9', type: 'expense', amount: 28, category: '咖啡', location: '星巴克', time: '15:20', icon: '☕' },
  { id: 't10', type: 'income', amount: 200, category: '兼职', note: '周末兼职收入', time: '13:00', icon: '💼' },
  { id: 't11', type: 'expense', amount: 38, category: '午餐', location: '公司食堂', time: '12:00', icon: '🍱' },
  { id: 't12', type: 'expense', amount: 30, category: '交通', location: '打车', time: '11:30', icon: '🚕' },
  { id: 't13', type: 'income', amount: 5000, category: '工资', note: '11月工资到账', time: '09:30', icon: '💰' },
  { id: 't14', type: 'expense', amount: 15, category: '早餐', location: '便利店', time: '08:45', icon: '🥤' },
  { id: 't15', type: 'expense', amount: 45.5, category: '晚餐', location: '海底捞火锅', note: '和朋友聚餐', time: '18:30', icon: '🍜' },
  { id: 't16', type: 'expense', amount: 299, category: '购物', location: '服装店', note: '买衣服', time: '10:15', icon: '👕' },
  { id: 't17', type: 'expense', amount: 4, category: '交通', location: '公交车', time: '08:20', icon: '🚌' },
  { id: 't18', type: 'expense', amount: 120, category: '其他', time: '12:30', icon: '🧾' },
];
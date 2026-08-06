export interface City {
  id: string
  name: string
  description: string
  coverImage?: string
  members: number
  posts: number
}

export interface Region {
  id: string
  name: string
  slug: string
  description: string
  coverImage?: string
  showRegion: boolean
  allowPosts: boolean
  allowComments: boolean
  allowLikes: boolean
  cities: City[]
}

export const MOCK_REGIONS: Region[] = [
  {
    id: '1',
    name: 'جهة طنجة - تطوان - الحسيمة',
    slug: 'tanger-tetouan-al-hoceima',
    description: 'الجهة الشمالية للمملكة المغربية، تطل على البحر الأبيض المتوسط والمحيط الأطلسي.',
    showRegion: true,
    allowPosts: true,
    allowComments: true,
    allowLikes: true,
    cities: [
      { id: 'c1', name: 'طنجة', description: 'مدينة ساحلية استراتيجية تطل على مضيق جبل طارق.', members: 85, posts: 14 },
      { id: 'c2', name: 'تطوان', description: 'عاصمة الشمال وملتقى الحضارات الأندلسية والمغربية.', members: 62, posts: 9 },
      { id: 'c3', name: 'الحسيمة', description: 'لؤلؤة البحر الأبيض المتوسط بشواطئها الخلابة.', members: 48, posts: 6 },
      { id: 'c4', name: 'شفشاون', description: 'المدينة الزرقاء الساحرة في جبال الريف.', members: 55, posts: 8 },
      { id: 'c5', name: 'العرائش', description: 'مدينة ساحلية تاريخية على المحيط الأطلسي.', members: 38, posts: 5 },
      { id: 'c6', name: 'وزان', description: 'مدينة تاريخية وروحية في شمال المغرب.', members: 32, posts: 4 },
      { id: 'c7', name: 'الفحص أنجرة', description: 'منطقة ساحلية قريبة من طنجة.', members: 25, posts: 3 },
      { id: 'c8', name: 'المضيق الفنيدق', description: 'منطقة سياحية ساحلية على البحر المتوسط.', members: 45, posts: 7 },
    ],
  },
  {
    id: '2',
    name: 'جهة الشرق',
    slug: 'oriental',
    description: 'الجهة الشرقية للمغرب، تمتد من البحر المتوسط شمالاً إلى الصحراء جنوباً.',
    showRegion: true,
    allowPosts: true,
    allowComments: true,
    allowLikes: true,
    cities: [
      { id: 'c9', name: 'وجدة', description: 'عاصمة الجهة الشرقية ومدينة الألف عام.', members: 70, posts: 11 },
      { id: 'c10', name: 'الناظور', description: 'مدينة ساحلية مهمة على البحر المتوسط.', members: 52, posts: 8 },
      { id: 'c11', name: 'بركان', description: 'مدينة فلاحية معروفة بإنتاج الحمضيات.', members: 38, posts: 5 },
      { id: 'c12', name: 'الدريوش', description: 'منطقة جبلية وساحلية في الريف الشرقي.', members: 22, posts: 3 },
      { id: 'c13', name: 'جرادة', description: 'مدينة منجمية تاريخية في شرق المغرب.', members: 18, posts: 2 },
      { id: 'c14', name: 'فكيك', description: 'واحة صحراوية بتاريخ عريق في أقصى الشرق.', members: 15, posts: 2 },
      { id: 'c15', name: 'تاوريرت', description: 'مدينة تاريخية بقصبتها الشهيرة.', members: 28, posts: 4 },
      { id: 'c16', name: 'جرسيف', description: 'ملتقى الطرق بين الشرق وفاس.', members: 25, posts: 3 },
    ],
  },
  {
    id: '3',
    name: 'جهة فاس - مكناس',
    slug: 'fes-meknes',
    description: 'الجهة الروحية والعلمية للمغرب، تضم أقدم الجامعات والمدن الإمبراطورية.',
    showRegion: true,
    allowPosts: true,
    allowComments: false,
    allowLikes: true,
    cities: [
      { id: 'c17', name: 'فاس', description: 'العاصمة العلمية والروحية للمملكة المغربية.', members: 95, posts: 18 },
      { id: 'c18', name: 'مكناس', description: 'المدينة الإمبراطورية بأسوارها ومعالمها التاريخية.', members: 72, posts: 12 },
      { id: 'c19', name: 'تازة', description: 'الممر الاستراتيجي بين الشرق والغرب.', members: 42, posts: 6 },
      { id: 'c20', name: 'صفرو', description: 'مدينة الشلالات والطبيعة الخلابة.', members: 30, posts: 4 },
      { id: 'c21', name: 'إفران', description: 'سويسرا المغرب بمناظرها الجبلية وثلوجها.', members: 38, posts: 7 },
      { id: 'c22', name: 'الحاجب', description: 'مدينة فلاحية في سفح الأطلس المتوسط.', members: 25, posts: 3 },
      { id: 'c23', name: 'بولمان', description: 'منطقة جبلية وسياحية في الأطلس المتوسط.', members: 20, posts: 2 },
      { id: 'c24', name: 'مولاي يعقوب', description: 'منتجع صحي طبيعي بمياهه الكبريتية.', members: 15, posts: 2 },
      { id: 'c25', name: 'تاونات', description: 'منطقة فلاحية خصبة في مقدمة جبال الريف.', members: 28, posts: 4 },
    ],
  },
  {
    id: '4',
    name: 'جهة الرباط - سلا - القنيطرة',
    slug: 'rabat-sale-kenitra',
    description: 'الجهة الإدارية والحكومية للمملكة، تضم العاصمة الرباط ومراكز القرار.',
    showRegion: true,
    allowPosts: true,
    allowComments: true,
    allowLikes: true,
    cities: [
      { id: 'c26', name: 'الرباط', description: 'عاصمة المملكة المغربية ومدينة الأنوار.', members: 120, posts: 22 },
      { id: 'c27', name: 'سلا', description: 'المدينة العريقة على الضفة اليمنى لنهر أبي رقراق.', members: 85, posts: 14 },
      { id: 'c28', name: 'القنيطرة', description: 'مدينة صناعية وميناء نهري مهم.', members: 65, posts: 10 },
      { id: 'c29', name: 'الخميسات', description: 'مدينة أمازيغية بالأطلس المتوسط.', members: 35, posts: 5 },
      { id: 'c30', name: 'سيدي قاسم', description: 'مركز فلاحي مهم في سهل الغرب.', members: 28, posts: 4 },
      { id: 'c31', name: 'سيدي سليمان', description: 'مدينة فلاحية في منطقة الغرب.', members: 22, posts: 3 },
      { id: 'c32', name: 'الصخيرات تمارة', description: 'منطقة ساحلية وسياحية قرب العاصمة.', members: 48, posts: 8 },
    ],
  },
  {
    id: '5',
    name: 'جهة بني ملال - خنيفرة',
    slug: 'beni-mellal-khenifra',
    description: 'الجهة الوسطى للمغرب، تجمع بين السهول الفلاحية وجبال الأطلس المتوسط.',
    showRegion: true,
    allowPosts: false,
    allowComments: false,
    allowLikes: true,
    cities: [
      { id: 'c33', name: 'بني ملال', description: 'عاصمة الجهة وبوابة الأطلس المتوسط.', members: 65, posts: 10 },
      { id: 'c34', name: 'أزيلال', description: 'منطقة جبلية سياحية بشلالات أوزود.', members: 32, posts: 5 },
      { id: 'c35', name: 'خنيفرة', description: 'المدينة الحمراء في قلب الأطلس المتوسط.', members: 40, posts: 6 },
      { id: 'c36', name: 'الفقيه بن صالح', description: 'مركز فلاحي وتجاري مهم.', members: 38, posts: 5 },
      { id: 'c37', name: 'خريبكة', description: 'عاصمة الفوسفاط المغربي.', members: 48, posts: 7 },
    ],
  },
  {
    id: '6',
    name: 'جهة الدار البيضاء - سطات',
    slug: 'casablanca-settat',
    description: 'القطب الاقتصادي والتجاري الأول للمغرب، تضم العاصمة الاقتصادية الدار البيضاء.',
    showRegion: true,
    allowPosts: true,
    allowComments: true,
    allowLikes: true,
    cities: [
      { id: 'c38', name: 'الدار البيضاء', description: 'العاصمة الاقتصادية وأكبر مدينة في المغرب.', members: 210, posts: 35 },
      { id: 'c39', name: 'المحمدية', description: 'مدينة ساحلية صناعية وترفيهية.', members: 75, posts: 12 },
      { id: 'c40', name: 'الجديدة', description: 'مدينة ساحلية تاريخية بمازاغان البرتغالية.', members: 58, posts: 9 },
      { id: 'c41', name: 'سطات', description: 'مركز فلاحي وتجاري في السهول الداخلية.', members: 45, posts: 7 },
      { id: 'c42', name: 'برشيد', description: 'مدينة فلاحية وصناعية سريعة النمو.', members: 38, posts: 5 },
      { id: 'c43', name: 'بنسليمان', description: 'منطقة غابوية وفلاحية قرب العاصمة الاقتصادية.', members: 22, posts: 3 },
      { id: 'c44', name: 'سيدي بنور', description: 'مدينة فلاحية معروفة بإنتاجها الزراعي.', members: 25, posts: 4 },
      { id: 'c45', name: 'النواصر', description: 'منطقة المطار الدولي محمد الخامس.', members: 30, posts: 4 },
      { id: 'c46', name: 'مديونة', description: 'منطقة صناعية ولوجستية قرب الدار البيضاء.', members: 20, posts: 2 },
    ],
  },
  {
    id: '7',
    name: 'جهة مراكش - آسفي',
    slug: 'marrakech-safi',
    description: 'الجهة السياحية الأولى للمغرب، تضم المدينة الحمراء مراكش وساحل المحيط الأطلسي.',
    showRegion: true,
    allowPosts: true,
    allowComments: true,
    allowLikes: true,
    cities: [
      { id: 'c47', name: 'مراكش', description: 'المدينة الحمراء وعاصمة السياحة المغربية.', members: 140, posts: 24 },
      { id: 'c48', name: 'آسفي', description: 'مدينة ساحلية تاريخية وعاصمة الفخار المغربي.', members: 52, posts: 8 },
      { id: 'c49', name: 'الصويرة', description: 'جوهرة المحيط الأطلسي ومدينة الرياح.', members: 48, posts: 9 },
      { id: 'c50', name: 'قلعة السراغنة', description: 'مركز فلاحي مهم في سهول الحوز.', members: 32, posts: 5 },
      { id: 'c51', name: 'الرحامنة', description: 'منطقة سهبية وفلاحية شمال مراكش.', members: 22, posts: 3 },
      { id: 'c52', name: 'شيشاوة', description: 'منطقة فلاحية تقع جنوب مدينة مراكش.', members: 25, posts: 4 },
      { id: 'c53', name: 'اليوسفية', description: 'مدينة منجمية وفلاحية في السهول الغربية.', members: 18, posts: 2 },
      { id: 'c54', name: 'الحوز', description: 'منطقة جبلية تضم جزءاً من الأطلس الكبير.', members: 20, posts: 3 },
    ],
  },
  {
    id: '8',
    name: 'جهة درعة - تافيلالت',
    slug: 'draa-tafilalet',
    description: 'الجهة الصحراوية الشرقية، مهد الدولة العلوية ومنبع التمور المغربية.',
    showRegion: true,
    allowPosts: false,
    allowComments: true,
    allowLikes: true,
    cities: [
      { id: 'c55', name: 'الرشيدية', description: 'عاصمة الجهة وبوابة الصحراء الشرقية.', members: 55, posts: 9 },
      { id: 'c56', name: 'ورزازات', description: 'هوليود إفريقيا ومدينة القصور والقصبات.', members: 42, posts: 7 },
      { id: 'c57', name: 'زاكورة', description: 'واحة النخيل وبوابة الصحراء الكبرى.', members: 30, posts: 5 },
      { id: 'c58', name: 'تنغير', description: 'مدينة الواحات ومضيق تودغا الشهير.', members: 35, posts: 6 },
      { id: 'c59', name: 'ميدلت', description: 'مدينة التفاح والجبال في الأطلس الكبير.', members: 28, posts: 4 },
    ],
  },
  {
    id: '9',
    name: 'جهة سوس - ماسة',
    slug: 'souss-massa',
    description: 'الجهة الجنوبية الغربية، قطب فلاحي وسياحي يطل على المحيط الأطلسي.',
    showRegion: true,
    allowPosts: true,
    allowComments: true,
    allowLikes: true,
    cities: [
      { id: 'c60', name: 'أكادير', description: 'عاصمة السياحة الشاطئية في المغرب.', members: 98, posts: 16 },
      { id: 'c61', name: 'إنزكان', description: 'قطب تجاري واقتصادي مهم في سوس.', members: 52, posts: 8 },
      { id: 'c62', name: 'تارودانت', description: 'المدينة العتيقة بسورها التاريخي.', members: 38, posts: 6 },
      { id: 'c63', name: 'تيزنيت', description: 'مدينة الفضة والحرف التقليدية.', members: 32, posts: 5 },
      { id: 'c64', name: 'اشتوكة آيت باها', description: 'منطقة فلاحية وساحلية خصبة.', members: 25, posts: 4 },
      { id: 'c65', name: 'طاطا', description: 'واحة صحراوية في جنوب شرق المغرب.', members: 15, posts: 2 },
    ],
  },
  {
    id: '10',
    name: 'جهة كلميم - واد نون',
    slug: 'guelmim-oued-noun',
    description: 'بوابة الصحراء المغربية، ملتقى الثقافات الصحراوية والأمازيغية.',
    showRegion: true,
    allowPosts: false,
    allowComments: true,
    allowLikes: false,
    cities: [
      { id: 'c66', name: 'كلميم', description: 'بوابة الصحراء ومدينة القوافل.', members: 32, posts: 5 },
      { id: 'c67', name: 'طانطان', description: 'مدينة المواسم الصحراوية والتراث الحساني.', members: 25, posts: 3 },
      { id: 'c68', name: 'سيدي إفني', description: 'مدينة ساحلية بشواطئها البكر.', members: 18, posts: 2 },
      { id: 'c69', name: 'آسا الزاك', description: 'واحة صحراوية في عمق الجنوب المغربي.', members: 12, posts: 2 },
    ],
  },
  {
    id: '11',
    name: 'جهة العيون - الساقية الحمراء',
    slug: 'laayoune-sakia-el-hamra',
    description: 'كبرى جهات الجنوب المغربي، عاصمة الصحراء المغربية.',
    showRegion: true,
    allowPosts: true,
    allowComments: true,
    allowLikes: true,
    cities: [
      { id: 'c70', name: 'العيون', description: 'عاصمة الصحراء المغربية وأكبر مدن الجنوب.', members: 55, posts: 9 },
      { id: 'c71', name: 'السمارة', description: 'مدينة تاريخية وروحية في عمق الصحراء.', members: 28, posts: 4 },
      { id: 'c72', name: 'بوجدور', description: 'مدينة ساحلية صحراوية على المحيط الأطلسي.', members: 22, posts: 3 },
      { id: 'c73', name: 'طرفاية', description: 'مدينة ساحلية جنوبية بتاريخ بحري عريق.', members: 18, posts: 2 },
    ],
  },
  {
    id: '12',
    name: 'جهة الداخلة - وادي الذهب',
    slug: 'dakhla-oued-eddahab',
    description: 'أقصى جنوب المغرب، جنة الرياضات المائية والصيد البحري.',
    showRegion: true,
    allowPosts: true,
    allowComments: true,
    allowLikes: true,
    cities: [
      { id: 'c74', name: 'الداخلة', description: 'جوهرة الجنوب وشبه جزيرة ساحرة.', members: 38, posts: 6 },
      { id: 'c75', name: 'أوسرد', description: 'منطقة صحراوية شاسعة في الجنوب الشرقي.', members: 10, posts: 1 },
    ],
  },
]

export const MOCK_STATS: Record<string, { members: number; posts: number; comments: number }> = {
  '1': { members: 390, posts: 56, comments: 278 },
  '2': { members: 268, posts: 38, comments: 154 },
  '3': { members: 365, posts: 58, comments: 312 },
  '4': { members: 403, posts: 66, comments: 348 },
  '5': { members: 223, posts: 33, comments: 128 },
  '6': { members: 523, posts: 81, comments: 425 },
  '7': { members: 357, posts: 58, comments: 286 },
  '8': { members: 190, posts: 31, comments: 142 },
  '9': { members: 260, posts: 41, comments: 198 },
  '10': { members: 87, posts: 12, comments: 54 },
  '11': { members: 123, posts: 18, comments: 78 },
  '12': { members: 48, posts: 7, comments: 32 },
}

export interface RegionFormData {
  name: string
  slug: string
  description: string
  coverImage?: string
}

export interface CityFormData {
  name: string
  description: string
  coverImage?: string
}

export const EMPTY_REGION_FORM: RegionFormData = {
  name: '',
  slug: '',
  description: '',
}

export const EMPTY_CITY_FORM: CityFormData = {
  name: '',
  description: '',
}

export function regionToForm(region: Region): RegionFormData {
  return {
    name: region.name,
    slug: region.slug,
    description: region.description,
  }
}

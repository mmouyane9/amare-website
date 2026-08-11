import type { PageSection } from '@/types/content'

export const SOS_AMARE_SECTIONS: PageSection[] = [
  {
    id: 'sec-sos-hero', type: 'hero', enabled: true, order: 1,
    data: {
      heading_ar: 'SOS AMARE', heading_fr: 'SOS AMARE',
      subheading_ar: 'خدمة المساعدة المجتمعية', subheading_fr: "Service d'aide communautaire",
      description_ar: 'نساعدك في العثور على أغراضك المفقودة بسرعة وبمساعدة المجتمع.',
      description_fr: "Nous vous aidons à retrouver vos objets perdus rapidement avec l'aide de la communauté.",
      backgroundImage: '',
      buttons: [
        { id: 'btn-sos-hero-report', label_ar: 'الإبلاغ عن غرض مفقود', label_fr: 'Signaler un objet perdu', url: '#sosForm', variant: 'primary' },
      ],
    },
  },
  {
    id: 'sec-sos-how', type: 'custom', enabled: true, order: 2,
    data: {
      _renderer: 'sosHow',
      eyebrow_ar: 'كيف تعمل الخدمة', eyebrow_fr: 'Comment fonctionne le service',
      heading_ar: 'خطوات بسيطة لاستعادة أغراضك', heading_fr: 'Étapes simples pour récupérer vos objets',
      description_ar: 'نعمل معًا كمجتمع لمساعدتك في العثور على ما فقدته بأسرع وقت ممكن.',
      description_fr: 'Nous travaillons ensemble en tant que communauté pour vous aider à retrouver ce que vous avez perdu dans les plus brefs délais.',
      steps: [
        { title_ar: 'الإبلاغ عن الغرض المفقود', title_fr: "Signaler l'objet perdu", description_ar: 'قم بملء النموذج بمعلومات دقيقة عن الغرض الذي فقدته.', description_fr: "Remplissez le formulaire avec des informations précises sur l'objet que vous avez perdu." },
        { title_ar: 'مراجعة البلاغ', title_fr: 'Vérification du signalement', description_ar: 'يقوم فريقنا بمراجعة وتدقيق المعلومات قبل النشر.', description_fr: 'Notre équipe examine et vérifie les informations avant publication.' },
        { title_ar: 'نشر البلاغ عبر الجمعية', title_fr: "Publication via l'association", description_ar: 'ننشر البلاغ عبر قنوات الجمعية ليصل إلى أكبر عدد من المجتمع.', description_fr: "Nous publions le signalement via les canaux de l'association pour atteindre le plus grand nombre." },
        { title_ar: 'التواصل مع صاحب الغرض عند العثور عليه', title_fr: 'Contact avec le propriétaire', description_ar: 'بمجرد العثور على الغرض، نتواصل معك مباشرة لإعادته.', description_fr: "Dès que l'objet est retrouvé, nous vous contactons directement pour vous le restituer." },
      ],
    },
  },
  {
    id: 'sec-sos-categories', type: 'custom', enabled: true, order: 3,
    data: {
      _renderer: 'sosCategories',
      eyebrow_ar: 'فئات الأغراض', eyebrow_fr: "Catégories d'objets",
      heading_ar: 'ماذا يمكنك أن تبلغ عنه؟', heading_fr: 'Que pouvez-vous signaler ?',
      description_ar: 'يمكنك الإبلاغ عن أي غرض مفقود من الفئات التالية أو غيرها.',
      description_fr: 'Vous pouvez signaler tout objet perdu parmi les catégories suivantes ou autres.',
      categories: [
        { title_ar: 'البطاقات الوطنية', title_fr: 'Cartes nationales' },
        { title_ar: 'جواز السفر', title_fr: 'Passeport' },
        { title_ar: 'رخصة السياقة', title_fr: 'Permis de conduire' },
        { title_ar: 'المحافظ', title_fr: 'Portefeuilles' },
        { title_ar: 'الهواتف', title_fr: 'Téléphones' },
        { title_ar: 'المفاتيح', title_fr: 'Clés' },
        { title_ar: 'الوثائق', title_fr: 'Documents' },
        { title_ar: 'أغراض أخرى', title_fr: 'Autres objets' },
      ],
    },
  },
  {
    id: 'sec-sos-form', type: 'custom', enabled: true, order: 4,
    data: {
      _renderer: 'sosForm',
      eyebrow_ar: 'نموذج التبليغ', eyebrow_fr: 'Formulaire de signalement',
      heading_ar: 'أبلغ عن غرض مفقود', heading_fr: 'Signaler un objet perdu',
      description_ar: 'املأ النموذج أدناه وسنتواصل معك في أقرب وقت.',
      description_fr: 'Remplissez le formulaire ci-dessous et nous vous contacterons dans les plus brefs délais.',
    },
  },
  {
    id: 'sec-sos-green', type: 'custom', enabled: true, order: 5,
    data: {
      _renderer: 'sosGreen',
      heading_ar: 'الرقم الأخضر', heading_fr: 'Numéro vert',
      description_ar: 'إذا كنت بحاجة إلى مساعدة عاجلة أو عثرت على غرض مفقود، يمكنك التواصل معنا مباشرة.',
      description_fr: "Si vous avez besoin d'une aide urgente ou avez trouvé un objet perdu, vous pouvez nous contacter directement.",
      number: '0800 00 00 00',
      hours_ar: 'ساعات العمل: من الإثنين إلى السبت | 9:00 - 18:00',
      hours_fr: 'Heures de travail : du lundi au samedi | 9h00 - 18h00',
      buttons: [
        { id: 'btn-sos-green-call', label_ar: 'اتصل الآن', label_fr: 'Appeler maintenant', url: 'tel:0800000000', variant: 'primary' },
        { id: 'btn-sos-green-wa', label_ar: 'واتساب', label_fr: 'WhatsApp', url: 'http://wa.me/+212684869996', variant: 'secondary' },
      ],
    },
  },
  {
    id: 'sec-sos-faq', type: 'custom', enabled: true, order: 6,
    data: {
      _renderer: 'sosFaq',
      eyebrow_ar: 'الأسئلة الشائعة', eyebrow_fr: 'Questions fréquentes',
      heading_ar: 'كل ما تحتاج معرفته', heading_fr: 'Tout ce que vous devez savoir',
      description_ar: 'إجابات على أكثر الأسئلة شيوعاً حول خدمة SOS AMARE.',
      description_fr: 'Réponses aux questions les plus fréquentes sur le service SOS AMARE.',
      items: [
        { question_ar: 'كيف أبلغ عن غرض مفقود؟', question_fr: 'Comment signaler un objet perdu ?', answer_ar: 'يمكنك الإبلاغ عن غرضك المفقود من خلال ملء النموذج أعلاه في هذه الصفحة. كل ما عليك هو إدخال معلوماتك الشخصية ووصف دقيق للغرض المفقود ومكان وزمان فقدانه. بعد ذلك سيقوم فريقنا بمراجعة البلاغ ونشره.', answer_fr: "Vous pouvez signaler votre objet perdu en remplissant le formulaire ci-dessus sur cette page. Il vous suffit de saisir vos informations personnelles et une description précise de l'objet perdu ainsi que le lieu et l'heure de sa perte. Notre équipe examinera ensuite le signalement et le publiera." },
        { question_ar: 'كم يستغرق نشر البلاغ؟', question_fr: 'Combien de temps prend la publication ?', answer_ar: 'نقوم بمراجعة البلاغات خلال 24 ساعة من استلامها. بعد التأكد من صحة المعلومات، يتم نشر البلاغ فوراً عبر قنوات الجمعية الرسمية ليصل إلى أكبر عدد ممكن من المجتمع.', answer_fr: "Nous examinons les signalements dans les 24 heures suivant leur réception. Après vérification des informations, le signalement est immédiatement publié via les canaux officiels de l'association." },
        { question_ar: 'هل الخدمة مجانية؟', question_fr: 'Le service est-il gratuit ?', answer_ar: 'نعم، خدمة SOS AMARE مجانية بالكامل. هي جزء من الخدمات المجتمعية التي تقدمها الجمعية المغربية لهواة البحث والاستكشاف لمساعدة المجتمع دون أي مقابل مادي.', answer_fr: "Oui, le service SOS AMARE est entièrement gratuit. Il fait partie des services communautaires offerts par l'Association Marocaine des Amateurs de Recherche et d'Exploration." },
        { question_ar: 'ماذا أفعل إذا عثرت على غرض مفقود؟', question_fr: 'Que faire si je trouve un objet perdu ?', answer_ar: 'إذا عثرت على غرض مفقود، يمكنك التواصل معنا مباشرة عبر الرقم الأخضر أو واتساب. سنقوم بمطابقة الغرض مع البلاغات الموجودة لدينا والتواصل مع صاحبه. كما يمكنك تسليمه لأقرب فرع من فروع الجمعية.', answer_fr: "Si vous trouvez un objet perdu, vous pouvez nous contacter directement via le numéro vert ou WhatsApp. Nous ferons correspondre l'objet avec les signalements existants et contacterons son propriétaire." },
      ],
    },
  },
  {
    id: 'sec-sos-cta', type: 'custom', enabled: true, order: 7,
    data: {
      _renderer: 'sosCta',
      heading_ar: 'ساعدنا في إعادة المفقودات إلى أصحابها.',
      heading_fr: 'Aidez-nous à restituer les objets perdus à leurs propriétaires.',
      description: '',
      buttons: [
        { id: 'btn-sos-cta-report', label_ar: 'الإبلاغ عن غرض مفقود', label_fr: 'Signaler un objet perdu', url: '#sosForm', variant: 'primary' },
        { id: 'btn-sos-cta-contact', label_ar: 'الاتصال بنا', label_fr: 'Nous contacter', url: '../contact.html', variant: 'secondary' },
      ],
    },
  },
]

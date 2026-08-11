import type { PageSection } from '@/types/content'

export const AMARE_MAGAZINE_SECTIONS: PageSection[] = [
  {
    id: 'sec-mag-hero', type: 'hero', enabled: true, order: 1,
    data: {
      heading_ar: 'مجلة AMARE', heading_fr: 'Magazine AMARE',
      subheading: '',
      description_ar: 'مجلة رقمية تنشر آخر المقالات والأخبار والدراسات والقصص المرتبطة بالبحث والاستكشاف وأنشطة الجمعية.',
      description_fr: "Magazine numérique publiant les derniers articles, actualités, études et récits liés à la recherche, à l'exploration et aux activités de l'association.",
      backgroundImage: '',
      buttons: [
        { id: 'btn-mag-hero-latest', label_ar: 'اقرأ أحدث المقالات', label_fr: 'Lire les derniers articles', url: '#magLatest', variant: 'primary' },
        { id: 'btn-mag-hero-browse', label_ar: 'تصفح المجلة', label_fr: 'Parcourir le magazine', url: '#magCats', variant: 'secondary' },
      ],
    },
  },
  {
    id: 'sec-mag-featured', type: 'custom', enabled: true, order: 2,
    data: {
      _renderer: 'magFeatured',
      badge_ar: 'دراسات', badge_fr: 'Études',
      heading_ar: 'اكتشاف مواقع أثرية جديدة في الجنوب الشرقي للمغرب',
      heading_fr: 'Découverte de nouveaux sites archéologiques au sud-est du Maroc',
      excerpt_ar: 'في إطار الأنشطة الميدانية للجمعية، تمكن فريق من المستكشفين من توثيق مجموعة من المواقع الأثرية غير المكتشفة سابقاً في منطقة الجنوب الشرقي، مما يفتح آفاقاً جديدة للبحث العلمي.',
      excerpt_fr: "Dans le cadre des activités de terrain de l'association, une équipe d'explorateurs a réussi à documenter un ensemble de sites archéologiques inédits dans la région du sud-est, ouvrant de nouvelles perspectives pour la recherche scientifique.",
      date_ar: '15 يونيو 2026', date_fr: '15 juin 2026',
      readTime_ar: '8 دقائق قراءة', readTime_fr: '8 minutes de lecture',
      image: '', linkUrl: '#',
      linkLabel_ar: 'اقرأ المزيد', linkLabel_fr: 'Lire la suite',
    },
  },
  {
    id: 'sec-mag-latest', type: 'custom', enabled: true, order: 3,
    data: {
      _renderer: 'magLatest',
      eyebrow_ar: 'أحدث المقالات', eyebrow_fr: 'Derniers articles',
      heading_ar: 'آخر ما نشر في المجلة', heading_fr: 'Dernières publications',
      description_ar: 'تصفح أحدث المقالات والدراسات والتقارير التي ينشرها فريق المجلة.',
      description_fr: "Parcourez les derniers articles, études et rapports publiés par l'équipe du magazine.",
      articles: [
        { image:'',badge_ar:'التراث',badge_fr:'Patrimoine',title_ar:'الحفاظ على التراث المادي في القرى الجبلية المغربية',title_fr:'Préservation du patrimoine matériel dans les villages de montagne marocains',excerpt_ar:'دراسة ميدانية حول أهمية الحفاظ على التراث المعماري التقليدي في القرى الجبلية بالمغرب ودور المجتمع المحلي في ذلك.',excerpt_fr:"Étude de terrain sur l'importance de la préservation du patrimoine architectural traditionnel dans les villages de montagne au Maroc.",date_ar:'10 يوليو 2026',date_fr:'10 juillet 2026',readTime_ar:'6 دقائق',readTime_fr:'6 minutes',linkUrl:'#' },
        { image:'',badge_ar:'البيئة',badge_fr:'Environnement',title_ar:'تأثير التغيرات المناخية على النظم البيئية في الأطلس الكبير',title_fr:'Impact des changements climatiques sur les écosystèmes du Haut Atlas',excerpt_ar:'تقرير شامل حول تأثير التغيرات المناخية على التنوع البيولوجي والغطاء النباتي.',excerpt_fr:"Rapport complet sur l'impact des changements climatiques sur la biodiversité.",date_ar:'5 يوليو 2026',date_fr:'5 juillet 2026',readTime_ar:'7 دقائق',readTime_fr:'7 minutes',linkUrl:'#' },
        { image:'',badge_ar:'الاستكشاف',badge_fr:'Exploration',title_ar:'رحلة استكشافية إلى مغارة فريواطو: اكتشافات جديدة تحت الأرض',title_fr:'Expédition à la grotte de Friouato : nouvelles découvertes souterraines',excerpt_ar:'فريق من مستكشفي الجمعية يخوض مغامرة استكشافية داخل واحدة من أكبر المغارات في شمال المغرب.',excerpt_fr:"Une équipe d'explorateurs de l'association se lance dans une aventure à l'intérieur de l'une des plus grandes grottes du nord du Maroc.",date_ar:'28 يونيو 2026',date_fr:'28 juin 2026',readTime_ar:'5 دقائق',readTime_fr:'5 minutes',linkUrl:'#' },
        { image:'',badge_ar:'الأنشطة',badge_fr:'Activités',title_ar:'تغطية خاصة: المسابقة الوطنية للبحث والاستكشاف 2026',title_fr:"Couverture spéciale : Concours national de recherche et d'exploration 2026",excerpt_ar:'تغطية شاملة لفعاليات المسابقة الوطنية للبحث والاستكشاف.',excerpt_fr:"Couverture complète des événements du concours national de recherche et d'exploration.",date_ar:'20 يونيو 2026',date_fr:'20 juin 2026',readTime_ar:'10 دقائق',readTime_fr:'10 minutes',linkUrl:'#' },
        { image:'',badge_ar:'التقارير',badge_fr:'Rapports',title_ar:'حصيلة أنشطة الجمعية للنصف الأول من سنة 2026',title_fr:"Bilan des activités de l'association pour le premier semestre 2026",excerpt_ar:'تقرير إحصائي مفصل يلخص أبرز أنشطة وإنجازات الجمعية.',excerpt_fr:"Rapport statistique détaillé résumant les principales activités et réalisations de l'association.",date_ar:'12 يونيو 2026',date_fr:'12 juin 2026',readTime_ar:'4 دقائق',readTime_fr:'4 minutes',linkUrl:'#' },
        { image:'',badge_ar:'المقالات',badge_fr:'Articles',title_ar:'دور البحث العلمي في حماية المواقع الأثرية بالمغرب',title_fr:'Le rôle de la recherche scientifique dans la protection des sites archéologiques au Maroc',excerpt_ar:'مقال تحليلي يناقش أهمية البحث العلمي والتوثيق الأثري.',excerpt_fr:"Article analytique discutant de l'importance de la recherche scientifique et de la documentation archéologique.",date_ar:'1 يونيو 2026',date_fr:'1er juin 2026',readTime_ar:'6 دقائق',readTime_fr:'6 minutes',linkUrl:'#' },
      ],
    },
  },
  {
    id: 'sec-mag-cats', type: 'custom', enabled: true, order: 4,
    data: {
      _renderer: 'magCats',
      eyebrow_ar: 'تصفح حسب التصنيف', eyebrow_fr: 'Parcourir par catégorie',
      heading_ar: 'فئات المجلة', heading_fr: 'Catégories du magazine',
      description_ar: 'استكشف محتوى المجلة حسب الفئة التي تهمك.',
      description_fr: 'Explorez le contenu du magazine par catégorie.',
      categories: [
        { title_ar:'الأخبار',title_fr:'Actualités',count_ar:'12 مقالاً',count_fr:'12 articles' },
        { title_ar:'المقالات',title_fr:'Articles',count_ar:'18 مقالاً',count_fr:'18 articles' },
        { title_ar:'الدراسات',title_fr:'Études',count_ar:'9 مقالات',count_fr:'9 articles' },
        { title_ar:'التقارير',title_fr:'Rapports',count_ar:'7 مقالات',count_fr:'7 articles' },
        { title_ar:'الأنشطة',title_fr:'Activités',count_ar:'15 مقالاً',count_fr:'15 articles' },
        { title_ar:'البيئة',title_fr:'Environnement',count_ar:'10 مقالات',count_fr:'10 articles' },
        { title_ar:'التراث',title_fr:'Patrimoine',count_ar:'14 مقالاً',count_fr:'14 articles' },
        { title_ar:'الاستكشاف',title_fr:'Exploration',count_ar:'16 مقالاً',count_fr:'16 articles' },
      ],
    },
  },
  {
    id: 'sec-mag-newsletter', type: 'custom', enabled: true, order: 5,
    data: {
      _renderer: 'magNewsletter',
      heading_ar: 'اشترك في مجلة AMARE', heading_fr: 'Abonnez-vous au Magazine AMARE',
      description_ar: 'توصل بأحدث المقالات والدراسات والأخبار مباشرة على بريدك الإلكتروني.',
      description_fr: 'Recevez les derniers articles, études et actualités directement sur votre e-mail.',
      buttonLabel_ar: 'اشترك الآن', buttonLabel_fr: "S'abonner maintenant",
    },
  },
  {
    id: 'sec-mag-cta', type: 'custom', enabled: true, order: 6,
    data: {
      _renderer: 'magCta',
      heading_ar: 'اكتشف المزيد من المقالات والمواضيع المميزة.',
      heading_fr: "Découvrez plus d'articles et de sujets remarquables.",
      buttons: [
        { id: 'btn-mag-cta-all', label_ar: 'جميع المقالات', label_fr: 'Tous les articles', url: '#magLatest', variant: 'primary' },
        { id: 'btn-mag-cta-contact', label_ar: 'تواصل معنا', label_fr: 'Contactez-nous', url: '../contact.html', variant: 'secondary' },
      ],
    },
  },
]

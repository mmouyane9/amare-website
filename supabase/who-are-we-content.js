/* ==========================================================================
   من نحن Content Service — loads the من نحن page sections from Supabase
   page_sections table and injects dynamic content into every section.

   Architecture:
     1. Load pages WHERE slug='/Who%20are%20we/index.html' AND status='published'
     2. Load page_sections WHERE page_id = about.id AND visible = true
     3. Merge content + settings + styles → flat data object
     4. Inject each section into the existing DOM
     5. Hardcoded fallback for every section — website never breaks
   ========================================================================== */

(function () {
  'use strict';

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function el(selector) {
    return document.querySelector(selector);
  }

  /* ------------------------------------------------------------------
     Hardcoded fallback data — bilingual _ar/_fr format
     ------------------------------------------------------------------ */
  var FALLBACK = {
    hero: {
      heading_ar: 'تعرف على الجمعية',
      heading_fr: 'Découvrez l\'association',
      subheading_ar: 'من نحن',
      subheading_fr: 'Qui sommes-nous',
      description_ar: 'اكتشف رؤية الجمعية الوطنية ورسالتها وقيمها، وتعرف على مكتبها المركزي وخارطة توسعها في مختلف جهات المملكة المغربية.',
      description_fr: 'Découvrez la vision nationale de l\'association, sa mission, ses valeurs, son bureau central et sa carte d\'expansion dans les différentes régions du Royaume du Maroc.',
      buttons: [
        { label_ar: 'الرؤية الوطنية', label_fr: 'Vision nationale', url: '#national-vision' },
        { label_ar: 'الرسالة', label_fr: 'Mission', url: '#mission' },
        { label_ar: 'القيم', label_fr: 'Valeurs', url: '#values' },
        { label_ar: 'المكتب المركزي', label_fr: 'Bureau central', url: '#central-office' },
        { label_ar: 'خارطة التوسع', label_fr: 'Carte d\'expansion', url: '#expansion-map' },
      ],
    },
    nationalVision: {
      eyebrow_ar: 'ماذا نطمح إليه',
      eyebrow_fr: 'Ce à quoi nous aspirons',
      heading_ar: 'الرؤية الوطنية',
      heading_fr: 'La vision nationale',
      description_ar: 'نطمح إلى أن نكون الجمعية الوطنية الرائدة في توحيد هواة البحث والاستكشاف تحت رؤية مشتركة ترتكز على العلم والمعرفة والوعي البيئي والانتماء الوطني. نؤمن بأن الإنسان المغربي الواعي، حين يُمنح الفرصة والمعرفة، قادر على حماية ثروات بلاده الطبيعية والثقافية وضمان استدامتها للأجيال القادمة، عبر استكشاف مسؤول يزاوج بين شغف المغامرة والالتزام بالأخلاقيات والممارسات المثلى.',
      description_fr: 'Nous aspirons à devenir l\'association nationale de référence dans l\'unification des amateurs de recherche et d\'exploration autour d\'une vision commune fondée sur la science, la connaissance, la conscience environnementale et l\'appartenance nationale. Nous croyons que le citoyen marocain conscient, lorsqu\'il reçoit l\'opportunité et le savoir, est capable de protéger les richesses naturelles et culturelles de son pays et d\'assurer leur durabilité pour les générations futures, à travers une exploration responsable alliant la passion de l\'aventure et l\'engagement envers l\'éthique et les meilleures pratiques.',
      cards: [
        { title_ar: 'أجيال واعية', title_fr: 'Générations conscientes', description_ar: 'نعمل على تكوين أجيال شابة واعية بأهمية العلم والبحث، قادرة على فهم تراثها الوطني والمساهمة في تطويره وحمايته بمسؤولية.', description_fr: 'Nous œuvrons à former des générations de jeunes conscients de l\'importance de la science et de la recherche, capables de comprendre leur patrimoine national et de contribuer à son développement et à sa protection de manière responsable.' },
        { title_ar: 'تراث مستدام', title_fr: 'Patrimoine durable', description_ar: 'نحافظ على التراث الطبيعي والثقافي المغربي ونثمّنه، لضمان انتقاله بكامل قيمته إلى الأجيال القادمة.', description_fr: 'Nous préservons et valorisons le patrimoine naturel et culturel marocain, afin d\'assurer sa transmission dans toute sa valeur aux générations futures.' },
        { title_ar: 'استكشاف مسؤول', title_fr: 'Exploration responsable', description_ar: 'نلتزم بمدونة أخلاقية صارمة تجعل من كل خرج ميداني فرصة للاستكشاف العلمي الآمن والمحترم للبيئة والمجتمعات المحلية.', description_fr: 'Nous nous engageons à respecter un code éthique strict qui fait de chaque sortie sur le terrain une opportunité d\'exploration scientifique sûre et respectueuse de l\'environnement et des communautés locales.' },
      ],
    },
    mission: {
      eyebrow_ar: 'غايتنا',
      eyebrow_fr: 'Notre raison d\'être',
      heading_ar: 'رسالتنا',
      heading_fr: 'Notre mission',
      description_ar: 'تتمثل رسالتنا في نشر ثقافة البحث والاستكشاف وتشجيع الشباب على المشاركة في المبادرات العلمية والبيئية، والمساهمة في حماية التراث الطبيعي والثقافي المغربي، وبناء مجتمع واعٍ يعتمد على المعرفة والعمل التطوعي. نعمل على تجسيد هذه الرسالة عبر برامج ميدانية وأنشطة توثيقية وتكوينية ترافق الهواة من مختلف الفئات والأعمار، وتكرّس القيم العلمية والأخلاقية في كل خطوة نقوم بها.',
      description_fr: 'Notre mission est de diffuser la culture de la recherche et de l\'exploration, d\'encourager les jeunes à participer aux initiatives scientifiques et environnementales, de contribuer à la protection du patrimoine naturel et culturel marocain, et de bâtir une communauté consciente fondée sur la connaissance et le bénévolat. Nous concrétisons cette mission à travers des programmes de terrain et des activités de documentation et de formation qui accompagnent les amateurs de tous âges et de tous horizons, en consacrant les valeurs scientifiques et éthiques dans chaque étape que nous entreprenons.',
    },
    values: {
      eyebrow_ar: 'ماذا نؤمن به',
      eyebrow_fr: 'Ce en quoi nous croyons',
      heading_ar: 'قيمنا',
      heading_fr: 'Nos valeurs',
      description_ar: 'ثماني قيم جوهرية تترجم مبادئنا إلى سلوك يومي ملموس في كل ما نقوم به.',
      description_fr: 'Huit valeurs fondamentales qui traduisent nos principes en comportements quotidiens concrets dans tout ce que nous entreprenons.',
      cards: [
        { title_ar: 'النزاهة', title_fr: 'Intégrité', description_ar: 'الالتزام بالشفافية والصدق في جميع أعمال الجمعية.', description_fr: 'Engagement envers la transparence et l\'honnêteté dans toutes les activités de l\'association.' },
        { title_ar: 'العمل الجماعي', title_fr: 'Travail d\'équipe', description_ar: 'نؤمن بأن النجاح يتحقق من خلال التعاون وروح الفريق.', description_fr: 'Nous croyons que le succès s\'obtient par la collaboration et l\'esprit d\'équipe.' },
        { title_ar: 'الابتكار', title_fr: 'Innovation', description_ar: 'تشجيع الأفكار الجديدة والحلول الإبداعية في البحث والاستكشاف.', description_fr: 'Encourager les idées nouvelles et les solutions créatives dans la recherche et l\'exploration.' },
        { title_ar: 'المسؤولية', title_fr: 'Responsabilité', description_ar: 'تحمل المسؤولية تجاه المجتمع والبيئة والتراث الوطني.', description_fr: 'Assumer la responsabilité envers la société, l\'environnement et le patrimoine national.' },
        { title_ar: 'الاحترام', title_fr: 'Respect', description_ar: 'احترام الجميع وتعزيز ثقافة الحوار والتعاون.', description_fr: 'Respecter chacun et promouvoir la culture du dialogue et de la coopération.' },
        { title_ar: 'التطوع', title_fr: 'Bénévolat', description_ar: 'غرس روح المبادرة وخدمة المجتمع دون مقابل.', description_fr: 'Inculquer l\'esprit d\'initiative et le service à la communauté sans contrepartie.' },
        { title_ar: 'الاستدامة', title_fr: 'Durabilité', description_ar: 'المحافظة على الموارد الطبيعية للأجيال القادمة.', description_fr: 'Préserver les ressources naturelles pour les générations futures.' },
        { title_ar: 'التميز', title_fr: 'Excellence', description_ar: 'السعي المستمر نحو الجودة والاحترافية في جميع المبادرات.', description_fr: 'La recherche continue de la qualité et du professionnalisme dans toutes les initiatives.' },
      ],
    },
    centralOffice: {
      eyebrow_ar: 'عن المكتب المركزي',
      eyebrow_fr: 'À propos du bureau central',
      heading_ar: 'المكتب المركزي',
      heading_fr: 'Le bureau central',
      description_ar: 'يُعد المكتب المركزي الهيئة التنفيذية العليا للجمعية المغربية لهواة البحث والاستكشاف؛ فهو المسؤول عن إدارة شؤون الجمعية، ووضع الخطط الاستراتيجية، وتنسيق الأنشطة الوطنية بين الفروع، وتعزيز الشراكات مع المؤسسات، وضمان تحقيق أهداف الجمعية ورسالتها في مختلف جهات المملكة، مع الحرص على الالتزام بالقيم والمبادئ التي تقوم عليها الجمعية.',
      description_fr: 'Le bureau central est l\'organe exécutif suprême de l\'Association Marocaine des Amateurs de Recherche et d\'Exploration. Il est responsable de la gestion des affaires de l\'association, de l\'élaboration des plans stratégiques, de la coordination des activités nationales entre les branches, du renforcement des partenariats avec les institutions et de la garantie de la réalisation des objectifs et de la mission de l\'association dans les différentes régions du Royaume, tout en veillant au respect des valeurs et des principes fondateurs de l\'association.',
      teamEyebrow_ar: 'فريق القيادة',
      teamEyebrow_fr: 'Équipe dirigeante',
      teamHeading_ar: 'أعضاء المكتب المركزي',
      teamHeading_fr: 'Membres du bureau central',
      teamDescription_ar: 'يتكون المكتب المركزي من نخبة من الكفاءات الوطنية التي تسهر على تحقيق أهداف الجمعية وترجمة رؤيتها إلى واقع.',
      teamDescription_fr: 'Le bureau central est composé d\'une élite de compétences nationales qui veillent à la réalisation des objectifs de l\'association et à la concrétisation de sa vision.',
      members: [
        {
          name_ar: 'عبد الرحيم العسري',
          name_fr: 'Abderrahim El Assri',
          role_ar: 'رئيس المكتب المركزي',
          role_fr: 'Président du bureau central',
          bio_ar: 'خبرة واسعة في تدبير الشأن الجمعوي وقيادة الفرق، يشرف على تنفيذ الرؤية الاستراتيجية للجمعية ومتابعة برامجها الوطنية.',
          bio_fr: 'Vaste expérience en gestion associative et leadership d\'équipe. Il supervise la mise en œuvre de la vision stratégique de l\'association et le suivi de ses programmes nationaux.',
          color: '#123B78',
          facebook: '#', instagram: '#', linkedin: '#', profileUrl: '#',
        },
        {
          name_ar: 'فاطمة الزهراء بنعلي',
          name_fr: 'Fatima Zahra Benali',
          role_ar: 'عضو المكتب المركزي',
          role_fr: 'Membre du bureau central',
          bio_ar: 'تساهم في تنسيق العمل بين اللجان والمكتب المركزي، وتدبير ملفات التكوين والتأطير لفائدة المنخرطين والمنخرطات.',
          bio_fr: 'Elle contribue à la coordination du travail entre les commissions et le bureau central, et à la gestion des dossiers de formation et d\'encadrement au profit des adhérents.',
          color: '#0F9CD1',
          facebook: '#', instagram: '#', linkedin: '#', profileUrl: '#',
        },
        {
          name_ar: 'يوسف أيت لحسن',
          name_fr: 'Youssef Ait Lahcen',
          role_ar: 'عضو المكتب المركزي',
          role_fr: 'Membre du bureau central',
          bio_ar: 'يساهم في تدبير الميزانية والمحاسبة، ويحرص على الشفافية في تدبير الموارد المالية وفق مقتضيات القانون الأساسي للجمعية.',
          bio_fr: 'Il contribue à la gestion du budget et de la comptabilité, et veille à la transparence dans la gestion des ressources financières conformément aux dispositions du statut de l\'association.',
          color: '#17A44E',
          facebook: '#', instagram: '#', linkedin: '#', profileUrl: '#',
        },
        {
          name_ar: 'خديجة إدريسي',
          name_fr: 'Khadija Idrissi',
          role_ar: 'عضو المكتب المركزي',
          role_fr: 'Membre du bureau central',
          bio_ar: 'تساهم في تدبير الجانب الإداري والتوثيقي، وتتبع أشغال المكتب والجمع العام، وتنسيق المراسلات مع الشركاء والمؤسسات.',
          bio_fr: 'Elle contribue à la gestion administrative et documentaire, au suivi des travaux du bureau et de l\'assemblée générale, et à la coordination des correspondances avec les partenaires et les institutions.',
          color: '#DB2777',
          facebook: '#', instagram: '#', linkedin: '#', profileUrl: '#',
        },
        {
          name_ar: 'محمد الصقلي',
          name_fr: 'Mohammed Skalli',
          role_ar: 'عضو المكتب المركزي',
          role_fr: 'Membre du bureau central',
          bio_ar: 'يساهم في إعداد التقارير ومحاضر الاجتماعات، ومواكبة الملفات الإدارية والقانونية المرتبطة بتسيير الجمعية.',
          bio_fr: 'Il contribue à la préparation des rapports et des procès-verbaux de réunions, et au suivi des dossiers administratifs et juridiques liés à la gestion de l\'association.',
          color: '#2563EB',
          facebook: '#', instagram: '#', linkedin: '#', profileUrl: '#',
        },
      ],
    },
    expansionMap: {
      eyebrow_ar: 'رؤيتنا للتوسع',
      eyebrow_fr: 'Notre vision de l\'expansion',
      heading_ar: 'خارطة التوسع الوطني',
      heading_fr: 'Carte de l\'expansion nationale',
      description_ar: 'تنبني استراتيجية التوسع لدى الجمعية على مبدأ التقريب: تقريب الهيكل التنظيمي من الهواة أينما كانوا، وتمكينهم من الانخراط في العمل الجمعوي دون عناء التنقل، مع الحرص على توحيد معايير العمل وجودة البرامج عبر جميع الفروع، وتعزيز الشراكات المحلية والجهوية، والاستثمار في قيادات محلية مؤهلة قادرة على ترجمة رسالة الجمعية داخل جهاتها.',
      description_fr: 'La stratégie d\'expansion de l\'association repose sur le principe de proximité : rapprocher la structure organisationnelle des amateurs où qu\'ils soient, leur permettre de s\'engager dans le travail associatif sans la contrainte du déplacement, tout en veillant à l\'uniformisation des normes de travail et de la qualité des programmes dans toutes les branches, au renforcement des partenariats locaux et régionaux, et à l\'investissement dans des leaders locaux qualifiés capables de concrétiser la mission de l\'association dans leurs régions.',
      mapEyebrow_ar: 'الخريطة التفاعلية',
      mapEyebrow_fr: 'La carte interactive',
      mapHeading_ar: 'خريطة جهات المملكة',
      mapHeading_fr: 'Carte des régions du Royaume',
      mapDescription_ar: 'انقر على أي جهة لاستكشاف حالة التوسع، وعدد الفروع النشطة أو المرتقبة في كل جهة.',
      mapDescription_fr: 'Cliquez sur n\'importe quelle région pour explorer l\'état de l\'expansion et le nombre de branches actives ou prévues dans chaque région.',
      legendTitle_ar: 'دليل الألوان',
      legendTitle_fr: 'Légende',
      legendSub_ar: 'حالة التوسع في جهات المملكة',
      legendSub_fr: 'État de l\'expansion dans les régions du Royaume',
      legendActive_ar: 'فروع نشطة',
      legendActive_fr: 'Branches actives',
      legendUpcoming_ar: 'فروع مرتقبة',
      legendUpcoming_fr: 'Branches à venir',
      legendFuture_ar: 'توسع مستقبلي',
      legendFuture_fr: 'Expansion future',
      emptyDetail_ar: 'انقر على أي جهة في الخريطة لعرض تفاصيل التوسع بها.',
      emptyDetail_fr: 'Cliquez sur une région de la carte pour afficher les détails de son expansion.',
      regions: [
        { id: 'MA09', name_ar: 'سوس - ماسة', name_fr: 'Souss-Massa', status: 'active', branches: 4 },
        { id: 'MA01', name_ar: 'طنجة - تطوان - الحسيمة', name_fr: 'Tanger-Tétouan-Al Hoceïma', status: 'active', branches: 1 },
        { id: 'MA03', name_ar: 'فاس - مكناس', name_fr: 'Fès-Meknès', status: 'active', branches: 2 },
        { id: 'MA04', name_ar: 'الرباط - سلا - القنيطرة', name_fr: 'Rabat-Salé-Kénitra', status: 'active', branches: 2 },
        { id: 'MA06', name_ar: 'الدار البيضاء - سطات', name_fr: 'Casablanca-Settat', status: 'active', branches: 3 },
        { id: 'MA02', name_ar: 'الشرق', name_fr: 'Oriental', status: 'upcoming', branches: 0 },
        { id: 'MA05', name_ar: 'بني ملال - خنيفرة', name_fr: 'Béni Mellal-Khénifra', status: 'upcoming', branches: 1 },
        { id: 'MA07', name_ar: 'مراكش - آسفي', name_fr: 'Marrakech-Safi', status: 'upcoming', branches: 1 },
        { id: 'MA08', name_ar: 'درعة - تافيلالت', name_fr: 'Drâa-Tafilalet', status: 'upcoming', branches: 0 },
        { id: 'MA10', name_ar: 'كلميم - واد نون', name_fr: 'Guelmim-Oued Noun', status: 'future', branches: 0 },
        { id: 'MA11', name_ar: 'العيون - الساقية الحمراء', name_fr: 'Laâyoune-Sakia El Hamra', status: 'future', branches: 0 },
        { id: 'MA12', name_ar: 'الداخلة - وادي الذهب', name_fr: 'Dakhla-Oued Eddahab', status: 'future', branches: 0 },
      ],
    },
    cta: {
      heading_ar: 'كن جزءاً من مسيرتنا',
      heading_fr: 'Faites partie de notre parcours',
      description_ar: 'انضم إلى شبكة الهواة والباحثين والمتطوعين الذين يشاركوننا الشغف بالاستكشاف والالتزام بحماية تراث المغرب، وساهم معنا في بناء غدٍ أكثر استدامة.',
      description_fr: 'Rejoignez le réseau d\'amateurs, de chercheurs et de bénévoles qui partagent avec nous la passion de l\'exploration et l\'engagement envers la protection du patrimoine marocain, et contribuez avec nous à construire un avenir plus durable.',
      buttonLabel_ar: 'انخرط معنا',
      buttonLabel_fr: 'Rejoignez-nous',
      buttonUrl: '../Join us/join-us-online.html',
    },
  };

  /* ------------------------------------------------------------------
     Translate a text value via the page-content dictionary for the
     active language. Arabic values stay as-is in Arabic mode; in every
     other language, an I18n.t() lookup is performed. Translations that
     do not match any dictionary key fall back to the original Arabic. */
  function L(text) {
    if (text == null || text === '') return '';
    if (!window.I18n) return text;
    var lang = window.I18n.getCurrentLanguage();
    if (lang === 'ar') return text;
    var result = window.I18n.t(text);
    if (result !== text) return result;
    return text;
  }

  /* ------------------------------------------------------------------
     HERO injector
     ------------------------------------------------------------------ */
  function injectHero(d) {
    var badge = el('.about-hero-badge');
    if (badge) {
      var svg = badge.querySelector('svg');
      badge.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(pickBilingual(d, 'subheading'));
    }

    var h1 = el('.about-hero h1');
    if (h1) {
      var parts = pickBilingual(d, 'heading').split(' ');
      var lastWord = parts.pop();
      var rest = parts.join(' ');
      h1.innerHTML = esc(rest) + ' <span>' + esc(lastWord) + '</span>';
    }

    var desc = el('.about-hero p');
    if (desc) desc.textContent = pickBilingual(d, 'description');

    var navLinks = el('.about-nav-links');
    if (navLinks && d.buttons) {
      var anchors = navLinks.querySelectorAll('a');
      for (var i = 0; i < anchors.length; i++) {
        var a = anchors[i];
        var b = d.buttons[i];
        if (b) {
          a.href = b.url || '#';
          a.textContent = pickBilingual(b, 'label');
          a.style.display = '';
        } else {
          a.style.display = 'none';
        }
      }
    }
  }

  /* ------------------------------------------------------------------
     NATIONAL VISION injector
     ------------------------------------------------------------------ */
  function injectNationalVision(d) {
    var eyebrow = el('#national-vision .eyebrow');
    if (eyebrow) eyebrow.textContent = pickBilingual(d, 'eyebrow');

    var heading = el('#national-vision .nv-vision-title');
    if (heading) heading.textContent = pickBilingual(d, 'heading');

    var desc = el('#national-vision .nv-vision-lead');
    if (desc) desc.textContent = pickBilingual(d, 'description');

    var cards = document.querySelectorAll('#national-vision .nv-vision-card');
    if (d.cards) {
      for (var i = 0; i < Math.min(cards.length, d.cards.length); i++) {
        var h3 = cards[i].querySelector('h3');
        var p = cards[i].querySelector('p');
        if (h3) h3.textContent = pickBilingual(d.cards[i], 'title');
        if (p) p.textContent = pickBilingual(d.cards[i], 'description');
      }
    }
  }

  /* ------------------------------------------------------------------
     MISSION injector
     ------------------------------------------------------------------ */
  function injectMission(d) {
    var eyebrow = el('#mission .eyebrow');
    if (eyebrow) eyebrow.textContent = pickBilingual(d, 'eyebrow');

    var heading = el('#mission .om-mission-title');
    if (heading) heading.textContent = pickBilingual(d, 'heading');

    var desc = el('#mission .om-mission-lead');
    if (desc) desc.textContent = pickBilingual(d, 'description');
  }

  /* ------------------------------------------------------------------
     VALUES injector
     ------------------------------------------------------------------ */
  function injectValues(d) {
    var eyebrow = el('#values .eyebrow');
    if (eyebrow) eyebrow.textContent = pickBilingual(d, 'eyebrow');

    var heading = el('#values .section-title');
    if (heading) heading.textContent = pickBilingual(d, 'heading');

    var desc = el('#values .section-desc');
    if (desc) desc.textContent = pickBilingual(d, 'description');

    var cards = document.querySelectorAll('#values .ov-value-card');
    if (d.cards) {
      for (var i = 0; i < Math.min(cards.length, d.cards.length); i++) {
        var h3 = cards[i].querySelector('h3');
        var p = cards[i].querySelector('p');
        if (h3) h3.textContent = pickBilingual(d.cards[i], 'title');
        if (p) p.textContent = pickBilingual(d.cards[i], 'description');
      }
    }
  }

  /* ------------------------------------------------------------------
     Bilingual helper — picks key_lang, falls back to key_ar
     ------------------------------------------------------------------ */
  function pickBilingual(data, key) {
    if (!data) return '';
    var lang = (window.I18n && window.I18n.getCurrentLanguage) ? window.I18n.getCurrentLanguage() : 'ar';
    var value = data[key + '_' + lang];
    if (value != null && value !== '') return value;
    value = data[key + '_ar'];
    if (value != null && value !== '') return value;
    return data[key] || '';
  }

  /* ------------------------------------------------------------------
     CENTRAL OFFICE injector
     ------------------------------------------------------------------ */
  function injectCentralOffice(d) {
    var eyebrow = el('#central-office .co-about .eyebrow');
    if (eyebrow) eyebrow.textContent = pickBilingual(d, 'eyebrow');

    var heading = el('#central-office .co-about-title');
    if (heading) heading.textContent = pickBilingual(d, 'heading');

    var desc = el('#central-office .co-about-lead');
    if (desc) desc.textContent = pickBilingual(d, 'description');

    var teamEyebrow = el('#central-office .co-team .eyebrow');
    if (teamEyebrow) teamEyebrow.textContent = pickBilingual(d, 'teamEyebrow');

    var teamHeading = el('#central-office .co-team .section-title');
    if (teamHeading) teamHeading.textContent = pickBilingual(d, 'teamHeading');

    var teamDesc = el('#central-office .co-team .section-desc');
    if (teamDesc) teamDesc.textContent = pickBilingual(d, 'teamDescription');

    if (d.members) {
      var lang = (window.I18n && window.I18n.getCurrentLanguage) ? window.I18n.getCurrentLanguage() : 'ar';
      var membersLocalized = d.members.map(function(m) {
        return {
          name: pickBilingual(m, 'name'),
          name_ar: m.name_ar || m.name || '',
          role: pickBilingual(m, 'role'),
          bio: pickBilingual(m, 'bio'),
          color: m.color,
          facebook: m.facebook,
          instagram: m.instagram,
          linkedin: m.linkedin,
          profileUrl: m.profileUrl,
        };
      });
      window.__AMARE_ABOUT_CO_MEMBERS = membersLocalized;
    }

    var event = new CustomEvent('about-cms-ready');
    document.dispatchEvent(event);
  }

  /* ------------------------------------------------------------------
     EXPANSION MAP injector
     ------------------------------------------------------------------ */
  function injectExpansionMap(d) {
    var eyebrow = el('#expansion-map .em-vision .eyebrow');
    if (eyebrow) eyebrow.textContent = pickBilingual(d, 'eyebrow');

    var heading = el('#expansion-map .em-vision-title');
    if (heading) heading.textContent = pickBilingual(d, 'heading');

    var desc = el('#expansion-map .em-vision-lead');
    if (desc) desc.textContent = pickBilingual(d, 'description');

    var mapEyebrow = el('#expansion-map .em-map .eyebrow');
    if (mapEyebrow) mapEyebrow.textContent = pickBilingual(d, 'mapEyebrow');

    var mapHeading = el('#expansion-map .em-map .section-title');
    if (mapHeading) mapHeading.textContent = pickBilingual(d, 'mapHeading');

    var mapDesc = el('#expansion-map .em-map .section-desc');
    if (mapDesc) mapDesc.textContent = pickBilingual(d, 'mapDescription');

    var legendTitle = el('.em-legend-title');
    if (legendTitle) legendTitle.textContent = pickBilingual(d, 'legendTitle');

    var legendSub = el('.em-legend-sub');
    if (legendSub) legendSub.textContent = pickBilingual(d, 'legendSub');

    var legendItems = document.querySelectorAll('.em-legend-item');
    if (legendItems.length >= 3) {
      legendItems[0].childNodes[legendItems[0].childNodes.length - 1].textContent = pickBilingual(d, 'legendActive');
      legendItems[1].childNodes[legendItems[1].childNodes.length - 1].textContent = pickBilingual(d, 'legendUpcoming');
      legendItems[2].childNodes[legendItems[2].childNodes.length - 1].textContent = pickBilingual(d, 'legendFuture');
    }

    var emptyDetail = el('.em-map-detail.is-empty span');
    if (emptyDetail) emptyDetail.textContent = pickBilingual(d, 'emptyDetail');

    if (d.regions) {
      var regionsLocalized = d.regions.map(function(r) {
        return {
          id: r.id,
          name: pickBilingual(r, 'name'),
          status: r.status,
          branches: r.branches,
        };
      });
      window.__AMARE_ABOUT_REGIONS = regionsLocalized;
    }
  }

  /* ------------------------------------------------------------------
     CTA injector
     ------------------------------------------------------------------ */
  function injectCta(d) {
    var h2 = el('#about-cta h2');
    if (h2) h2.textContent = pickBilingual(d, 'heading');

    var p = el('#about-cta p');
    if (p) p.textContent = pickBilingual(d, 'description');

    var buttons = document.querySelectorAll('#about-cta .about-cta-actions a');
    if (buttons.length > 0) {
      var btn = buttons[0];
      if (d.buttonLabel_ar) {
        var svg = btn.querySelector('svg');
        btn.textContent = pickBilingual(d, 'buttonLabel');
        if (svg) btn.appendChild(svg);
      }
      if (d.buttonUrl) btn.href = d.buttonUrl;
    }
  }

  /* ------------------------------------------------------------------
     Dispatch
     ------------------------------------------------------------------ */
  function injectSection(section) {
    if (!section || !section.enabled) return;
    var type = section.type;
    var data = section.data || {};
    var renderer = data._renderer || '';

    console.log('[About CMS] Dispatching section:', { type: type, renderer: renderer, fields: Object.keys(data) });

    if (type === 'hero') {
      return injectHero(data);
    }

    if (type === 'cta') {
      return injectCta(data);
    }

    if (type === 'custom') {
      switch (renderer) {
        case 'nationalVision': return injectNationalVision(data);
        case 'mission':        return injectMission(data);
        case 'values':         return injectValues(data);
        case 'centralOffice':  return injectCentralOffice(data);
        case 'expansionMap':   return injectExpansionMap(data);
      }
    }

    console.log('[About CMS] Unhandled section:', type, renderer);
  }

  /* ------------------------------------------------------------------
     Supabase fetch
     ------------------------------------------------------------------ */
  function loadAboutFromSupabase(callback) {
    var MAX_RETRIES = 30;
    var RETRY_MS = 200;

    function tryLoad(retries) {
      var S = window.Supabase;
      if (!S || !S.getClient) {
        if (retries < MAX_RETRIES) {
          setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS);
          return;
        }
        console.log('[About CMS] Supabase client not available');
        return callback(null);
      }

      var client = S.getClient();
      if (!client) {
        if (retries < MAX_RETRIES) {
          setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS);
          return;
        }
        return callback(null);
      }

      console.log('[About CMS] Fetching about page data...');

      client
        .from('pages')
        .select('id, title, slug, status')
        .eq('slug', '/about')
        .eq('status', 'published')
        .single()
        .then(function (pageResult) {
          if (pageResult.error || !pageResult.data) {
            console.log('[About CMS] Page not found or not published:', pageResult.error);
            return callback(null);
          }
          var pageId = pageResult.data.id;

          client
            .from('page_sections')
            .select('id, section_type, section_key, content, settings, styles, visible, sort_order')
            .eq('page_id', pageId)
            .eq('visible', true)
            .order('sort_order', { ascending: true })
            .then(function (sectionsResult) {
              if (sectionsResult.error || !sectionsResult.data) {
                console.log('[About CMS] page_sections error:', sectionsResult.error);
                return callback(null);
              }

              var rows = sectionsResult.data;
              console.log('[About CMS] page_sections loaded:', rows.length);

              if (!Array.isArray(rows) || rows.length === 0) return callback(null);

              var sections = [];
              for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                var data = {};
                var content = row.content || {};
                var settings = row.settings || {};
                var styles = row.styles || {};

                for (var ck in content) {
                  if (Object.prototype.hasOwnProperty.call(content, ck)) data[ck] = content[ck];
                }
                for (var sk in settings) {
                  if (Object.prototype.hasOwnProperty.call(settings, sk)) data[sk] = settings[sk];
                }
                if (Object.keys(styles).length > 0) data._styles = styles;

                if (data._renderer === 'centralOffice') {
                  console.log('[CO DEBUG] Raw content from Supabase for centralOffice:', JSON.stringify(content));
                  console.log('[CO DEBUG] Flattened data.members:', data.members ? data.members.length : 'undefined');
                  if (data.members && data.members[0]) {
                    console.log('[CO DEBUG] Flattened data.members[0] keys:', Object.keys(data.members[0]));
                    console.log('[CO DEBUG] Flattened data.members[0]:', JSON.stringify(data.members[0]));
                  }
                }

                sections.push({
                  id: row.id,
                  type: row.section_type,
                  enabled: row.visible,
                  order: row.sort_order,
                  section_key: row.section_key || null,
                  data: data,
                });
              }

              return callback(sections);
            })
            .catch(function () {
              return callback(null);
            });
        })
        .catch(function () {
          return callback(null);
        });
    }

    tryLoad(0);
  }

  /* ------------------------------------------------------------------
     Inject all fallbacks
     ------------------------------------------------------------------ */
  function injectAllFallbacks() {
    injectHero(FALLBACK.hero);
    injectNationalVision(FALLBACK.nationalVision);
    injectMission(FALLBACK.mission);
    injectValues(FALLBACK.values);
    injectCentralOffice(FALLBACK.centralOffice);
    injectExpansionMap(FALLBACK.expansionMap);
    injectCta(FALLBACK.cta);
  }

  /* ------------------------------------------------------------------
     Bootstrap
     ------------------------------------------------------------------ */
  var _lastSections = null;

  function renderAllSections() {
    if (_lastSections && _lastSections.length > 0) {
      console.log('[About CMS] Re-rendering', _lastSections.length, 'CMS sections...');
      for (var i = 0; i < _lastSections.length; i++) {
        injectSection(_lastSections[i]);
      }
    } else {
      console.log('[About CMS] Re-rendering fallbacks...');
      injectAllFallbacks();
    }
    var event = new CustomEvent('about-cms-ready');
    document.dispatchEvent(event);
  }

  function init() {
    console.log('[About CMS] Starting...');

    loadAboutFromSupabase(function (sections) {
      if (sections && sections.length > 0) {
        _lastSections = sections;
        console.log('[About CMS] Loaded', sections.length, 'CMS sections — injecting...');
        for (var i = 0; i < sections.length; i++) {
          injectSection(sections[i]);
        }
        console.log('[About CMS] All sections injected.');
      } else {
        _lastSections = null;
        console.log('[About CMS] No CMS sections — using fallbacks.');
        injectAllFallbacks();
      }

      /* Signal that CMS data is ready (triggers map + member grid init) */
      var event = new CustomEvent('about-cms-ready');
      document.dispatchEvent(event);
    });

    /* Re-render everything when language changes */
    window.addEventListener('amare:langchange', function () {
      renderAllSections();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

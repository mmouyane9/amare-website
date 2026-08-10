const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zqfvtgmdpbhhiqluehuh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LkRDy3q61L79QaCRdWXqxA_fTuMm7sx';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const FRENCH_DATA = {
  _renderer: "centralOffice",
  eyebrow: "À propos du bureau central",
  heading: "Le bureau central",
  description: "Le bureau central est l'organe exécutif suprême de l'Association Marocaine des Amateurs de Recherche et d'Exploration. Il est responsable de la gestion des affaires de l'association, de l'élaboration des plans stratégiques, de la coordination des activités nationales entre les branches, du renforcement des partenariats avec les institutions et de la garantie de la réalisation des objectifs et de la mission de l'association dans les différentes régions du Royaume, tout en veillant au respect des valeurs et des principes fondateurs de l'association.",
  teamEyebrow: "Équipe dirigeante",
  teamHeading: "Membres du bureau central",
  teamDescription: "Le bureau central est composé d'une élite de compétences nationales qui veillent à la réalisation des objectifs de l'association et à la concrétisation de sa vision.",
  members: [
    {
      name: "Abderrahim El Assri",
      role: "Président du bureau central",
      bio: "Vaste expérience en gestion associative et leadership d'équipe. Il supervise la mise en œuvre de la vision stratégique de l'association et le suivi de ses programmes nationaux.",
      color: "#123B78",
      facebook: "#",
      instagram: "#",
      linkedin: "#",
      profileUrl: "#"
    },
    {
      name: "Fatima Zahra Benali",
      role: "Membre du bureau central",
      bio: "Elle contribue à la coordination du travail entre les commissions et le bureau central, et à la gestion des dossiers de formation et d'encadrement au profit des adhérents.",
      color: "#0F9CD1",
      facebook: "#",
      instagram: "#",
      linkedin: "#",
      profileUrl: "#"
    },
    {
      name: "Youssef Ait Lahcen",
      role: "Membre du bureau central",
      bio: "Il contribue à la gestion du budget et de la comptabilité, et veille à la transparence dans la gestion des ressources financières conformément aux dispositions du statut de l'association.",
      color: "#17A44E",
      facebook: "#",
      instagram: "#",
      linkedin: "#",
      profileUrl: "#"
    },
    {
      name: "Khadija Idrissi",
      role: "Membre du bureau central",
      bio: "Elle contribue à la gestion administrative et documentaire, au suivi des travaux du bureau et de l'assemblée générale, et à la coordination des correspondances avec les partenaires et les institutions.",
      color: "#DB2777",
      facebook: "#",
      instagram: "#",
      linkedin: "#",
      profileUrl: "#"
    },
    {
      name: "Mohammed Skalli",
      role: "Membre du bureau central",
      bio: "Il contribue à la préparation des rapports et des procès-verbaux de réunions, et au suivi des dossiers administratifs et juridiques liés à la gestion de l'association.",
      color: "#2563EB",
      facebook: "#",
      instagram: "#",
      linkedin: "#",
      profileUrl: "#"
    }
  ]
};

async function main() {
  console.log('Connecting to Supabase...');

  // Find the page with slug '/about'
  const { data: pages, error: pageError } = await supabase
    .from('pages')
    .select('id, title, slug')
    .eq('slug', '/about')
    .eq('status', 'published');

  if (pageError) {
    console.error('Error finding page:', pageError);
    return;
  }

  if (!pages || pages.length === 0) {
    console.error('No published page found with slug /about');
    return;
  }

  const page = pages[0];
  console.log(`Found page: ${page.title} (${page.id})`);

  // Find the central office section
  const { data: sections, error: sectionError } = await supabase
    .from('page_sections')
    .select('id, content')
    .eq('page_id', page.id)
    .eq('section_type', 'custom')
    .eq('visible', true);

  if (sectionError) {
    console.error('Error finding sections:', sectionError);
    return;
  }

  let coSection = null;
  for (const s of sections) {
    if (s.content && s.content._renderer === 'centralOffice') {
      coSection = s;
      break;
    }
  }

  if (!coSection) {
    console.error('Central office section not found. Available sections:');
    console.error(JSON.stringify(sections, null, 2));
    return;
  }

  console.log(`Found central office section: ${coSection.id}`);
  console.log('Current content (first 200 chars):', JSON.stringify(coSection.content).substring(0, 200));

  // Update with French translation
  const { error: updateError } = await supabase
    .from('page_sections')
    .update({ content: FRENCH_DATA })
    .eq('id', coSection.id);

  if (updateError) {
    console.error('Error updating section:', updateError);
    return;
  }

  console.log('Successfully updated central office section to French!');

  // Verify
  const { data: verify } = await supabase
    .from('page_sections')
    .select('content')
    .eq('id', coSection.id)
    .single();

  if (verify) {
    console.log('Verification - eyebrow:', verify.content.eyebrow);
    console.log('Verification - heading:', verify.content.heading);
    console.log('Verification - member 1 name:', verify.content.members[0].name);
    console.log('Verification - member 1 role:', verify.content.members[0].role);
  }
}

main().catch(console.error);

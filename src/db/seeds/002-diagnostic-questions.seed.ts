import { AppDataSource } from '../data-source';
import { Diagnostic } from '../entities/Diagnostic.entity';
import { Question, Theme } from '../entities/Question.entity';

/**
 * Seed Diagnostic v1.0.0 with 31 Questions
 * Source: Restoration_Diagnostic_Tool_31_Key_Factors-updated_February052026.csv
 * Distribution: 8 Motivate, 21 Enable, 2 Implement
 * Guidance is embedded in Question fields (definition, considerations, followUpQuestions, strategyExamples)
 * Last Updated: February 6, 2026
 */
export async function seedDiagnosticWithQuestions() {
  console.log('📋 Seeding Diagnostic v1.0.0 with 31 questions...');

  const diagnosticRepo = AppDataSource.getRepository(Diagnostic);
  const questionRepo = AppDataSource.getRepository(Question);

  // Check if diagnostic already exists
  let diagnostic = await diagnosticRepo.findOne({
    where: { version: 'v1.0.0', language: 'en' }
  });

  if (diagnostic) {
    console.log('⚠️  Diagnostic v1.0.0 already exists, checking questions...');
  } else {
    // Create diagnostic
    diagnostic = diagnosticRepo.create({
      title: 'Restoration Diagnostic Assessment Tool',
      description: 'Comprehensive assessment tool for evaluating restoration readiness across motivate, enable, and implement dimensions',
      version: 'v1.0.0',
      language: 'en'
    });
    await diagnosticRepo.save(diagnostic);
    console.log('✅ Diagnostic v1.0.0 created');
  }

  // Check if questions already exist
  const existingQuestions = await questionRepo.count({
    where: { diagnosticId: diagnostic.id }
  });

  if (existingQuestions > 0) {
    console.log(`⚠️  ${existingQuestions} questions already exist, skipping seed`);
    return;
  }

  // Seed questions (31 total: 8 Motivate, 21 Enable, 2 Implement)
  const questions = [
    // MOTIVATE Theme (8 questions)
    {
      questionCode: '1',
      theme: Theme.MOTIVATE,
      enablingCondition: 'a. Benefits',
      keySuccessFactor: '1. Restoration generates economic benefits',
      definition: 'Restoring the candidate area is expected to yield economic benefits (e.g., economic diversification, avoided damages, new marketable products) that create a net positive financial impact (private benefits) and/or net positive economy-wide impact (public benefits) relative to the status quo land use. Side note: "economic impacts referring to environmental benefits that function as public goods, or to economy-wide economic impacts that capture restoration-related spillovers across value chains and the broader economy, including GDP growth and employment. Such impacts typically arise from economic benefits like diversification, avoided damages, and new market products enabled by restoration.',
      questionText: '• Is restoring the target area expected to generate economic benefits that result in a net positive financial or economy-wide economic impact relative to the status quo land use?',
      considerations: '• Economic benefits from restoration are the overall positive outcomes for income or finance that result from implementing restoration activities versus a business-as-usual scenario.\n• Examples of economic benefits include increased income, improved entrepreneurship opportunities, increased production of key commodities, or new employment opportunities that result from restoration efforts. A more complete list of possible benefits is included in this tool in the "Restoration Benefits" table.\n• The timeframe of this answer should consider the timeframe of the anticipated restoration activities, recognizing that restoration processes and their benefits occur over the long-term.\n• Make note of which individuals or groups would likely receive these benefits.\n• Some landowners may be concerned that "restoration" means they will lose their land, user rights, or income relative to the status quo. Therefore, the answer to this question can be supported with documents that show how the net benefits outweigh the costs.Side note: formalized land rights might emerge as a positive co-benefit of the restoration project. In some cases, implementing the project and disbursing finance to support restoration activities may require clear land rights to be clearly defined. Consequently, this could accelerate demarcation processes and enable local communities to obtain legal title to their land.',
      followUpQuestions: '• If "yes", then what are the expected economic benefits?\n• If "yes", then who benefits?\n• If "no", then how big is the expected financial or economic gap?',
      strategyExamples: '• Conduct a benefit-cost analysis comparing (a) likely benefits generated from the restored landscape, (b) likely costs of restoring the target landscape, and (c) likely costs and benefits of the status quo use of the landscape.',
      sortOrder: 1
    },
    {
      questionCode: '2',
      theme: Theme.MOTIVATE,
      enablingCondition: 'a. Benefits',
      keySuccessFactor: '2. Restoration generates social benefits',
      definition: 'Restoring the target area is expected to improve livelihoods, elevate the social or political standing of vulnerable populations, safeguard or restore natural cultural heritage sites or the use of culturally significant practices, or yield other social, cultural, and/or political benefits for the local population.',
      questionText: '• Is restoring the target area expected to generate social, cultural, or political benefits for the people living in that area, including vulnerable groups such as women, youth and Indigenous people?',
      considerations: '• Review the list of possible social benefits in the "Restoration Benefits" table found in the supporting materials for this tool. For example, restoration activities may result in benefits that are more social, cultural or political in nature, such as increased visibility of cultural values, recognition of traditional ecological knowledge, achievement of political gains, increased recreational opportunities, or improvements in gender equity. Restoration can also be a way for governments to be seen as leaders on the global stage and achieve commitments to international agreements (e.g., UNFCCC, UNCCD, UNCBD, REDD+, SDGs). Furthermore, restoration can be beneficial to countries or communities with a historical cultural connection to forests or other ecosystems (e.g., forest-based traditions and folklore, ecosystem-based livelihoods and employment).\n• Consider whether the benefits list in the table are recognized or considered in restoration plans, programs, or activities in the target landscape.\n• Make note of which individuals or groups would likely receive these benefits.',
      followUpQuestions: '• If "yes", what are the expected social benefits?',
      strategyExamples: '• Engage communities living in and around the target landscape to identify their social, political, or cultural goals and priorities. This could be done through surverys or in-person workshops. Based on this exercise, co-create a map of restoration interventions that could help achieve these goals.\n• Validate existing restoration plans, financing instruments, monitoring systems, and indicators with local communities, including respresentatives from vulnerable populations, to ensure plans serve community needs.',
      sortOrder: 2
    },
    {
      questionCode: '3',
      theme: Theme.MOTIVATE,
      enablingCondition: 'b. Awareness',
      keySuccessFactor: '3. Restoration generates environmental benefits',
      definition: 'Restoring the target area is expected to generate substantial and long-term environmental benefits, including the conservation and recovery of biodiversity, enhanced climate change mitigation and adaptation, reduced land degradation and desertification, and the restoration of vital ecosystem services such as water regulation, soil fertility, and carbon sequestration. These improvements will contribute to increased ecological resilience and sustainable livelihoods over time.',
      questionText: '• Is restoring the target area expected to generate environmental benefits?',
      considerations: 'Examples of environmental benefits include enhanced biodiversity, improved watershed security, strengthened climate change mitigation and adaptation, and increased soil fertility, among others. A more comprehensive overview of anticipated environmental benefits is provided in the supporting materials for this diagnostic, in the "Restoration Benefits" table.',
      followUpQuestions: '• If "yes", then what are the expected environmental benefits?',
      strategyExamples: '• Engage scientists (e.g., biologists, ecologists, hydrologists, soil scientists) to identify which environmental benefits could be generated from restoration efforts.',
      sortOrder: 3
    },
    {
      questionCode: '4',
      theme: Theme.MOTIVATE,
      enablingCondition: 'b. Awareness',
      keySuccessFactor: '4. Benefits of restoration are publicly communicated',
      definition: 'The benefits of restoring the target landscape have been clearly communicated to land managers, vulnerable groups, and other relevant stakeholders',
      questionText: '• Are the benefits of restoring the target area communicated to all stakeholders, including vulnerable groups, and communication channels designed to reach these diverse stakeholders?',
      considerations: '• Communication may be through various channels, including articles, press, social media, radio and television, demonstration visits, street plays or other pathways that target relevant stakeholders and decision makers.\n• Peer-to-peer communication of restoration benefits can be an effective means of raising awareness and motivating action.\n• Consider whether this communication is organized as part of a larger stakeholder engagement strategy.\n• A more complete list of benefits is included in the supporting materials to diagnostic in the "Restoration Benefits" table.',
      followUpQuestions: '• What benefits might arise?\n• How has the communication specifically targeted or included key stakeholders?',
      strategyExamples: '• Produce awareness-raising materials and campaigns via newspapers, radio, television, internet, and/or site visits, depending on the target audience\n• Introduce and/or leverage existing national restoration activities such as public or school tree planting programs.',
      sortOrder: 4
    },
    {
      questionCode: '5',
      theme: Theme.MOTIVATE,
      enablingCondition: 'b. Awareness',
      keySuccessFactor: '5. Opportunities for restoration are identified',
      definition: 'Candidate areas for restoration have been identified and quantified.',
      questionText: '• Have target or priority areas for restoration been identified and quantified?',
      considerations: '• Target areas for restoration are the places where restoration efforts should occur based on a combination of environmental, social, and economic considerations.\n• Information on these opportunities may be presented in national or subnational maps and/or restoration strategies, and should be consistent with the areas that government agencies use when allocating funding, programs, planning resources for restoration.\n• Consider whether stakeholders recognize and reference the same priority levels.',
      followUpQuestions: '• If "yes", then where are the candidate areas?\n• If "yes", then how big is the restoration opportunity?',
      strategyExamples: '• Conduct a "Restoration Opportunities Assessment Methodology" planning activity. This is a comprehensive restoration planning resource available online https://iucn.org/resources/grey-literature/guide-restoration-opportunities-assessment-methodology-roam',
      sortOrder: 5
    },
    {
      questionCode: '6',
      theme: Theme.MOTIVATE,
      enablingCondition: 'c. Crisis events',
      keySuccessFactor: '6. Crisis events are leveraged',
      definition: 'The government and/or civil society use the risk or occasion of crisis events to build political and public support for ecosystem restoration.',
      questionText: '• Is the target area experiencing a crisis event, or the risk of one in the future, that would motivate restoration in the target landscape, and how could those events affect the different groups of population (rural and peasants, urban, indigenous, women, youth, etc)?',
      considerations: '• Crisis events can include floods, landslides, droughts, fires, sandstorms, wood shortages, declining crop yields, and unemployment, among others. Crises can include humanitarian catastrophes where damage could have been avoided if natural ecosystems were intact (e.g., a landslide), where the act of restoration could address the crisis (e.g., unemployment), or where restoration prevents future crises (e.g., floods).\n• One does not desire these events to occur. But when they do occur, restoration supporters should act quickly to mobilize political and community support for restoration.\n• In the context of climate change and resilience, be sure to consider both past climate impacts as well as future scenarios and to plan accordingly, where thresholds must now be calculated more broadly.',
      followUpQuestions: '• What types of crises have occurred in the target landscape in the past?\n• What types of crises could occur in the future?',
      strategyExamples: '• Conduct and communicate research that quantifies and visualizes the extent to which restored ecosystems can prevent or mitigate natural humanitarian disasters and save money on mitigation efforts when proper planning and prevention are implemented.\n• When disasters occur, immediately publicly communicate the benefits of restoration.',
      sortOrder: 6
    },
    {
      questionCode: '7',
      theme: Theme.MOTIVATE,
      enablingCondition: 'd. Legal requirements',
      keySuccessFactor: '7. Laws and policies requiring restoration exist',
      definition: 'The government has legislation and policies that require land managers to allow for recovery of natural vegetation or to replant trees in natural ecosystems that have been cleared in the candidate landscape.',
      questionText: '• Are law or policies in place requiring land owners or managers to replant or restore ecosystems in areas that have been cleared (e.g., forests, grasslands, wetlands)?',
      considerations: '• Consider whether legislation specifically mandates restoration, such as requirements for reforestation, obligations to rehabilitate land, or restoration regulations on extractive activities. Do these laws and policies specify who is required to restore, in what situations, and over what timeframes? Does this legal framework apply over the full boundaries of the target landscape? (I.e., are the requirements national in scope?)\n• Restoration requirements are more commonly directed at entities involved with commercial logging, mining, or other extractive activities than for subsistence activities.',
      followUpQuestions: '• If "yes", what specific terms and conditions does the law have (e.g., what to restore, by when, how)?',
      strategyExamples: '• Establish government law (or industry policy) that requires land managers to allow vegetation recovery or to replant vegetation in areas that have been cleared due to their own commercial activity (e.g., logging, mining, etc.).',
      sortOrder: 7
    },
    {
      questionCode: '8',
      theme: Theme.MOTIVATE,
      enablingCondition: 'd. Legal requirements',
      keySuccessFactor: '8. Laws and policies requiring restoration are broadly understood and enforced',
      definition: 'The laws and policies requiring tree recovery or replanting in the target landscape are understood by relevant actors and are enforced in a visible, credible, and fair manner.',
      questionText: '• Is the law or policy requiring ecosystem restoration enforced in a visible, credible, and fair manner and broadly understood by all relevant actors, including vulnerable groups?',
      considerations: '• It is not sufficient that a law requiring restoration merely exists; the law needs to be enforced fairly and understood by affected entities and enforced by authorities if it is to motivate restoration.\n• Consider whether the legal requirements for landscape restoration are communicated to key stakeholders and complemented by actions like communication campaigns, enforcement efforts (e.g., fines) for violation of restoration requirements, and ensuring adequate human and financial resources for enforcement.\n• Government mandates for restoration can trigger sensitivities about government involvement in land-use decisions that otherwise would be the purview of traditional communities or private landowners. Therefore, how legal requirements are communicated and complemented by other policies, incentives, and practices can be important for the success of the requirement.',
      followUpQuestions: '• It is not sufficient that a law requiring restoration merely exists; the law needs to be understood by affected entities and enforced by authorities if it is to motivate restoration.\n• If "no", then what is the nature of the shortcoming?',
      strategyExamples: '• Conduct communication campaign to make relevant actors aware of restoration requirements.\n• Take enforcement action (e.g., fines, denial of credit access, jail) against violations of restoration requirements.\n• Ensure human and financial resources for enforcement are adequate.',
      sortOrder: 8
    },

    // ENABLE Theme (21 questions)
    {
      questionCode: '9',
      theme: Theme.ENABLE,
      enablingCondition: 'e. Ecological conditions',
      keySuccessFactor: '9. Soil, water, climate, and fire conditions are suitable for restoration',
      definition: 'The target landscape\'s soil, rainfall, and temperature conditions are suitable for regrowth of natural vegetation, and the fire regime does not hinder recovery of natural ecosystems.',
      questionText: '• Are the target landscape\'s soil, rainfall, temperature, and fire and management conditions suitable for enabling growth and survival or planted or naturally regenerating vegetation?',
      considerations: '• This key factor combines multiple ecological conditions affecting ecosystem restoration. Each condition (soil, rainfall, temperature, fire) should be evaluated on its own, yet the response can reflect the aggregate of the four.',
      followUpQuestions: '• If "no", then what are the gaps in physical suitability? Are efforts to overcome these constraints feasible?',
      strategyExamples: '• Adaptively manage or adjust restoration plan (e.g., species mix) to match water and climate regime of landscape.\n• Launch program to prevent unwanted fires or introduce prescribed fires\n• Launch program to improve soil quality (e.g., plant nitrogen-fixing species).\n• Create bunds or half-moons to store water after rains',
      sortOrder: 9
    },
    {
      questionCode: '10',
      theme: Theme.ENABLE,
      enablingCondition: 'e. Ecological conditions',
      keySuccessFactor: '10. Plants and animals that can impede restoration are minimized',
      definition: 'Persistent invasive species in the target landscape can be managed or controlled to avoid interference with replanted or naturally regenerating vegetation. Restoration sites can be protected from grazing livestock that impede ecosystem recovery.',
      questionText: '• Can unwanted invasive plants and animals that hinder ecosystem recovery be effectively removed or controlled In the target landscape and restoration sites?',
      considerations: '• Consider whether there are monitoring or control measures (fencing, weed management, removal) in place to manage problematic or invasive species that can outcompete or exclude species used for restoration.\n• Landscapes may be free of unwanted plants and/or unwanted animals either because none ever existed naturally in the landscape or because they have been successfully minimized through management.\n• Examples of species that can impede restoration efforts include Brachiaria spp. in Brazil, Imperata cylindrica in Indonesia, Pueraria montana (kudzu) in southern United States, and uncontrolled grazing animals (cattle, sheep, goats) in multiple locations.',
      followUpQuestions: '• If "no", then what are the persistent plant and/or animal species and how do they affect ecosystem restoration?',
      strategyExamples: '• Implement program to remove invasive plants (e.g., using fast-growing native trees to shade out invasives, using goats, appropriate use of fire).\n• Implement program to exclude unwanted roaming livestock (e.g., incentives and training for fences).',
      sortOrder: 10
    },
    {
      questionCode: '11',
      theme: Theme.ENABLE,
      enablingCondition: 'e. Ecological conditions',
      keySuccessFactor: '11. Native seeds, seedlings, or source populations are readily available',
      definition: 'The target landscape has natural sources that support regeneration, such as nearby natural areas, regrowth from underground roots, animal-dispersed seeds, and easy access to low-cost native seeds and seedlings that support ecosystem recovery.',
      questionText: '• Does the target landscape have source populations, soil propagules bank (such as underground root systems and seed banks), or low-cost sources of native seeds and seedlings that can be the foundation for ecosystem recovery?',
      considerations: '• Viable source populations or soil propagules bank of native plants are critically important for passive restoration.\n• This key success factor applies to the entire supply chain for native seeds and seedling, including seed production, seed collection and processing, and seedling nurseries.',
      followUpQuestions: '• If "no", then where is the gap (e.g., seeds, seed collectors, nurseries, source populations, soil propagules banks?',
      strategyExamples: '• Establish laws protecting remaining tracts of native vegetation in candidate landscape.\n• Create financial incentives and capacity-building programs aimed at strengthening and increasing the number and quality of seedling nurseries and seed collector networks.',
      sortOrder: 11
    },
    {
      questionCode: '12',
      theme: Theme.ENABLE,
      enablingCondition: 'f. Economic conditions',
      keySuccessFactor: '12. Competing economic demands for land (e.g., food, fuel) that driveland degradation are being managed',
      definition: 'Demand for crop, livestock, fuel wood, and/or biofuel production on degraded or natural ecosystems in the target landscape is declining (e.g., due to productivity improvements elsewhere), thereby reducing pressures that drive land degradation and "freeing up" opportunities for restoration.',
      questionText: '• Are the economic pressures from crop, livestock, fuelwood, and/or biofuel production on degraded lands and natural ecosystems declining in the target landscape?)',
      considerations: '• Competing land-use pressures may come from agricultural expansion, infrastructure development, livestock grazing, fuel wood and urbanization.\n• This key success factor is arguably one of the most important in light of increasing global demand for land to produce crops, livestock, and biofuel (Searchinger et al. 2013).\n• This key factor would not apply when land is restored into agroforestry or silvopastoral systems which continue to produce crops and livestock, respectively.',
      followUpQuestions: '• What are the main alternative competing land uses for the candidate areas to be restored?',
      strategyExamples: '• Pursue technical and financial measures to increase the productivity (yields per hectare) of crops and livestock on existing nonmarginal agricultural land.\n• Pursue technical and financial measures to increase the supply of timber and agricultural products and of nonbiomass renewable energy from restored landscapes.\n• Avoid establishing bioenergy targets that could lead to degraded or former forestlands being converted to biomass plantations.\n• Do financial measures include policy incentives? A key strategy to address this economic pressure is to redirect incentives away from harmful land-use activities and toward regenerative agricultural practices.',
      sortOrder: 12
    },
    {
      questionCode: '13',
      theme: Theme.ENABLE,
      enablingCondition: 'f. Economic conditions',
      keySuccessFactor: '13. Value chains and/or market exist for commodity products (timber, agricultural products) and environmental products (carbon, water, biodiversity) from restored areas',
      definition: 'To the degree that forest restoration in the target landscape generates marketable products and services, value chains are in place allowing these products to get from the restored forest to the end consumer.',
      questionText: '• Are value chains in place allowing products from restored land to reach end consumers?',
      considerations: '• This key success factor refers to both market access and market demand for products and services derived from restored forest landscapes. A "value chain" describes the multiple steps involved in offering a product or service such as harvesting, collection, processing, transportation, and distribution. A value chain from restoration suggests that individuals or groups in the target landscape can derive livelihoods and local economic activities as a part of restoring ecosystems.\n• Consider if there are initiatives, cooperatives or businesses in the target landscapes that sell products or services as a result of restoration activities. Are producers in these places able to differentiate their products and services through labels, certifications, or access to preferred markets? Is there infrastructure for processing and aggregating the products and services offered from the target landscapes?\n• Services from restored ecosystems could include recreation, tourism, and water provisioning.',
      followUpQuestions: '• If "no", then where are the gaps in such a value chain?\n- If "yes," what is the value chain, including the producers, intermediaries, final consumers, etc.',
      strategyExamples: '• Encourage growth of markets (both supply and demand) for commodity products (timber, agricultural products) and environmental products (carbon, water, biodiversity) derived from restored landscapes.\n• Provide low-interest financing for businesses directly involved in the "restoration value chain."',
      sortOrder: 13
    },
    {
      questionCode: '14',
      theme: Theme.ENABLE,
      enablingCondition: 'g. Policy conditions',
      keySuccessFactor: '14. Landusers, landholders or communities hold secure tenure rights to land and natural resources on the land',
      definition: 'People and communities who manage the target landscape have clear and secure rights (e.g., in the form of land ownership or natural resource management rights) to the benefits that would accrue from restoration.',
      questionText: '• Do those who manage the target landscape have clear and secure rights to use land, harvest products sustainably, and receive financial benefits that would accrue from restoration? Are these rights accessible to all stakeholders, including women and vulnerable groups?',
      considerations: '• Lack of (or insecure) land tenure and natural resource rights in the target landscape can discourage restoration that involves human intervention. People will not invest in planting trees and native vegetation or allow natural regeneration on lands they manage if they are unlikely benefit from the restored state.\n• Tenure and natural resource rights can take the form of private land ownership, communal lands, customary agreements, user-right certificates, etc.\n• Also consider whether the tenure that is in place overlaps or conflicts with customary rights.',
      followUpQuestions: '• If "no", then what rights are missing, and for whom?',
      strategyExamples: '• Reform policies to ensure that land managers have clear and secure rights to land and the natural resources (e.g., trees) on their land.',
      sortOrder: 14
    },
    {
      questionCode: '15',
      theme: Theme.ENABLE,
      enablingCondition: 'g. Policy conditions',
      keySuccessFactor: '15. Policies affecting restoration are harmonized and streamlined',
      definition: 'Relevant public policies are aligned, coherent, and streamlined to effectively support restoration efforts in the target area. These policies are mutually reinforcing, minimize unnecessary administrative barriers, and create an enabling environment for implementation. Policies that promote gender equality and social inclusion are also considered integral to supporting inclusive and sustainable restoration outcomes.',
      questionText: '• Are policies that may could impact restoration in the target landscape aligned and streamlined at a global, national, subnational and local context?',
      considerations: '• National policies on climate, biodiversity, and land degradation will likely have points of overlap for restoration that can be considered through existing national committees.\n• Other policies to consider include those on agriculture, extractive industries, water, land use planning, infrastructure and natural resources.\n• In some cases, policies for nature conservation or other sectors may inhibit restoration (e.g., laws forbidding extraction of native seeds from protected areas, laws forbidding harvesting native tree species, subsidies that encourage to drivers of degradation).',
      followUpQuestions: '• If "no", then which policies are not aligned or streamlined?',
      strategyExamples: '• Conduct an assessment to identify existing policies that might impact the efficacy and efficiency of ecosystem restoration, determine whether or not each is mutually supportive, and recommend policy reforms to achieve greater alignment.',
      sortOrder: 15
    },
    {
      questionCode: '16',
      theme: Theme.ENABLE,
      enablingCondition: 'g. Policy conditions',
      keySuccessFactor: '16. Restrictions on clearing remaining natural ecosystems (e.g., forests, grasslands, wetlands) exist',
      definition: 'The target landscape has laws restricting clearing or cutting of remaining natural ecosystems.',
      questionText: '• Does the target landscape have laws restricting the clearing or cutting of remaining natural ecosystems?',
      considerations: '• Restrictions on clearing remaining natural forests and ecosystems can prevent further expansion of degraded or cleared areas. These restrictions also create an incentive to restore the productivity of already cleared areas since opportunities to use the forest frontier are reduced.\n• Restrictions can also take the form of an extensive network of national parks and national forests, an extensive network of forested indigenous territories, ecosystem protection rules on communal lands, "no net loss" rules, specific percentages of land required to remain as forest (e.g., Brazil\'s Forest Code) and more.\n• An important component of this key success factor is that "natural forests and ecosystems" have been clearly defined by the jurisdiction sponsoring the restriction (e.g., national government). This definition should include primary forests, secondary forests, and degraded forests and other ecosystems with potential for restoration.',
      followUpQuestions: '• If "yes", then what are those laws?',
      strategyExamples: '• Establish laws that restrict cutting or clearing of remaining natural ecosystemsEstablish, strengthen, and enforce legal and regulatory frameworks that restrict the cutting, clearing, or conversion of remaining natural ecosystems, ensuring long-term protection of critical habitats and ecological functions.',
      sortOrder: 16
    },
    {
      questionCode: '17',
      theme: Theme.ENABLE,
      enablingCondition: 'g. Policy conditions',
      keySuccessFactor: '17. Restrictions on clearing remaining natural ecosystems (e.g., forests, grasslands, wetlands) are enforced',
      definition: 'Laws that restrict clearing of remaining natural ecosystems are adequately enforced.',
      questionText: '• Are these clearing or cutting restrictions adequately enforced?',
      considerations: '• It is not sufficient that regulations restricting clearing of remaining natural ecosystems merely exist; the restrictions need to be enforced by relevant authorities.\n• Particularly in remote areas, enforcement depends on the capacity of law enforcement organizations and incentives for them to exercise enforcement activities.',
      followUpQuestions: '• If "no", then why not?',
      strategyExamples: '• Conduct communication campaign to make relevant actors aware of law.\n• Establish a forest cover change monitoring system to identify illegal clearing.\n• Take enforcement action (e.g., fines, denial of credit access) against violations of law.\n• Ensure human and financial resources for enforcement are adequate.',
      sortOrder: 17
    },
    {
      questionCode: '18',
      theme: Theme.ENABLE,
      enablingCondition: 'h. Social and cultural conditions',
      keySuccessFactor: '18. Women, youth, and Indigenous Peoples participate in restoration decision making',
      definition: 'Women, youth, and Indigenous Peoples are explicitly recognized and supported as key participants in restoration planning and implementation at all scales. Their cultural systems, traditional governance structures, and knowledge are respected and integrated into decision-making bodies, governance arrangements, and monitoring processes, ensuring inclusive, representative, and culturally appropriate restoration outcomes.',
      questionText: '• Are women, youth, and Indigenous Peoples living in and around the target area—along with the cultural systems, traditional governance structures, and knowledge systems they represent—meaningfully involved in restoration decision-making (e.g., program design, goal-setting, management, monitoring, and indicator selection)?',
      considerations: '• Decision-making related to areas—including planning, design, management, and monitoring—should be inclusive and culturally appropriate. Where participation is limited or extractive, restoration efforts risk fragmented uptake, weakened local ownership, and inequitable distribution of benefits, particularly for women, youth, and Indigenous Peoples.\n• Leveraging and strengthening existing local institutions and culturally grounded processes (e.g., village-based forestry cooperatives, women\'s groups, Indigenous Peoples\' organizations, youth associations, and traditional governance systems) can support co-management arrangements, enhance local participation, and increase long-term adoption of restoration efforts.\n• Restoration planning and implementation should recognize and respect cultural systems more broadly—including the values, knowledge, and practices of diverse stakeholder groups—and integrate these perspectives into decision-making, management, and monitoring processes.\n• Effective and inclusive participation requires transparency and accountability in decision-making, respect for Free, Prior, and Informed Consent (FPIC) where applicable, and accessible, trusted grievance and feedback mechanisms that allow stakeholders to raise concerns and enable course correction when processes or outcomes fall short.',
      followUpQuestions: '• If no, then which groups are not well represented?\n• If "no", then which aspects of restoration are vulnerable groups left out of or excluded from?',
      strategyExamples: '• Involve representatives from people living in and around the target landscape in the restoration process (e.g., goal-setting, design, implementation, monitoring, and indicator selection) and governance mechanisms (e.g., multi-stakeholder groups).\n• Cultivate restoration champion from local communities by conducting capacity building efforts or developing financial structures that prioritize community led restoration projects.\n• Take inclusive measures (e.g., intercultural or accommodating facilitation methods, open calls, workshops in local languages) to convene and reflect the diverse perspectives of all the people in the landscape\n• Use sex disaggregated data when measuring restoration participation, benefits, and other outcomes.',
      sortOrder: 18
    },
    {
      questionCode: '19',
      theme: Theme.ENABLE,
      enablingCondition: 'h. Social and cultural conditions',
      keySuccessFactor: '19. Local people benefit from restoration',
      definition: 'Communities who live in or around the target areas have their needs addressed from restoration efforts and receive environmental benefits (e.g., improved water quality, increased supply of forest products) or economic benefits (e.g., alternate sources of income, improved livelihoods) from restoration.',
      questionText: '• Are people living in and around the target area able to capture or enjoy the benefits generated by restoration, such as improved livelihoods or ecosystem services?',
      considerations: '• The planning documentation and technical design of any restoration initiative should include frameworks and mechanisms to ensure that people living in or adjacent to the restored area(s) are the primary beneficiaries of the positive outcomes of restoration. Examples of the types of benefits restoration can produce are available here.\n• Restoration planners or implementers should continually ask themselves: Among the social, cultural, political, environmental, and economic benefits identified, do restoration plans specify which local people or groups are expected to benefit from restoration activities? Do these benefits correspond with local needs? Are the benefits received by local people in a reasonable, equitable, and reliable way?\n• If local people do not perceive benefits, then they will have little incentive to change behaviors to enable restoration or sustain the restored landscape over the long term.',
      followUpQuestions: '• If "no", then what barriers or constraints are preventing local communities from accessing the benefits of restoration?',
      strategyExamples: '• Ensure that financial flows for the goods and/or services generated by the restored landscape (e.g., payments for ecosystem services) go to people living in and around the restored landscape.\n• Develop financial structures, such as bonds or outcome-based finance schemes, that reward local communities for restoring their environment.\n• Create participatory monitoring systems that enable local communities to report the benefits of restoration in the near- and long-term and inform future design changes or adjustments.\n• Allow local people to harvest some of the forest products from the restored landscape.',
      sortOrder: 19
    },
    {
      questionCode: '20',
      theme: Theme.ENABLE,
      enablingCondition: 'i. Institutional conditions',
      keySuccessFactor: '20. Roles and responsibilities for restoration are clearly defined',
      definition: 'Roles and responsibilities for restoration in the target landscape are clearly defined, understood among relevant actors (e.g., government, civil society, private sector and others relevant stakeholders), and accompanied by authority',
      questionText: 'Are the roles and responsibilities for ecosystem restoration in the target landscape clearly defined, understood by relevant actors, and accompanied by authority?',
      considerations: '• Consider whether there are designated agencies, institutions, or groups with the power to implement ecosystem restoration.\n• In the absence of clarity on roles and responsibilities, inaction may occur due to important roles not being filled, uncertainty about who does what, or due to institutions and groups claiming overlapping responsibility and rights.\n• To adequately answer this question, users may need to map out existing mandates for restoration planning, coordination, implementation and monitoring among public entities, private groups and organizations, land owners, land users, and other key stakeholders. Roles, responsibilities and rights can also be defined in laws, policies or customary practices.',
      followUpQuestions: '• If "no", then what is missing in terms of clarity of roles and responsibilities?',
      strategyExamples: '• Create a national, state, local or watershed-level Ecosystem Restoration Platform or Commitee that articulates roles and responsibilities among government, civil society, academic, and private sector entities and other relevant stakeholders.',
      sortOrder: 20
    },
    {
      questionCode: '21',
      theme: Theme.ENABLE,
      enablingCondition: 'i. Institutional conditions',
      keySuccessFactor: '21.Effective institutional coordination is ongoing',
      definition: 'Relevant actors from government, civil society, and/or the private sector are sufficiently coordinated to design, implement, and monitor restoration in the target area.',
      questionText: 'Are relevant stakeholders from government, civil society, and the private sector effectively coordinated—such as through a working group or multistakeholder process—to design, implement, and monitor ecosystem restoration in the candidate area, while also ensuring that these efforts are inclusive of vulnerable groups?',
      considerations: '• Consider whether public and private institutions have committed to clear leadership and mandates for restoration. Is there demonstrated joint action in the form of coordination mechanisms, committees, working groups or alliances that meet regularly and make decisions about restoration? Do these coordination efforts include shared plans, data, technical input, and monitoring, especially across local, regional and national levels of governance?',
      followUpQuestions: '• If "no", then what is missing in terms of coordination?',
      strategyExamples: '• Within government, create an interministerial Ecosystem Restoration Task Force charged with coordinating government (national, state, municipal) activities on restoration.\n• Create a multisector stakeholder restoration initiative that sets the vision and coordinates restoration activities across the landscape (e.g., the Brazilian Atlantic Forest PACT).',
      sortOrder: 21
    },
    {
      questionCode: '22',
      theme: Theme.ENABLE,
      enablingCondition: 'j. Leadership',
      keySuccessFactor: '22. National and/or local restoration champions exist',
      definition: 'Charismatic people (or powerful institutions) exist who can effectively inspire decision makers to pursue restoration, mobilize support, and maintain momentum over time in the candidate landscape.',
      questionText: '• Is there a charismatic, committed champion(s) of restoration for the target area? Do they represent all stakeholders in society, including women, youth, and Indigenous peoples?',
      considerations: '• Champions can be individuals or groups who are committed to landscape restoration, and able to act upon these commitments. In some landscapes or ecosystmes, champions may need to be cultivated and given a visible profile.\n• Historically, successful examples of restoration had either a champion or strong government support. Few lacked both.',
      followUpQuestions: '• Who is the champion(s)?',
      strategyExamples: '• Cultivate, support, and give a voice to prospective restoration champions (individuals, organizations).\n• Convene meetings of champions and prospective champions from multiple locations (even outside the candidate landscape) so they inspire each other and share best practices.',
      sortOrder: 22
    },
    {
      questionCode: '23',
      theme: Theme.ENABLE,
      enablingCondition: 'j. Leadership',
      keySuccessFactor: '23. Sustained political commitment exists',
      definition: 'Commitment from government authorities (across relevant levels, where applicable) and non-governmental institutions to restoration in the target area is clearly established and recognized as a sustained, long-term commitment.',
      questionText: '• Is there clear and sustained long-term commitment from government and non-governmental institutions to support restoration efforts in the target landscape?',
      considerations: '• It may be difficult to predict the long-term commitment of a government or organization. In such situations, consider whether the commitment transcends political parties and whether the restoration will produce recurring benefits for key stakeholders.',
      followUpQuestions: '• If "yes", what is the proof of the expressed commitment, and from whom?',
      strategyExamples: '• Create and mobilize a broad constituency (representing multiple sectors including agriculture) that keeps restoration on the national political agenda.',
      sortOrder: 23
    },
    {
      questionCode: '24',
      theme: Theme.ENABLE,
      enablingCondition: 'k. Knowledge',
      keySuccessFactor: '24. Restoration "know how" relevant to candidate landscapes exist',
      definition: 'Local experts know of -- or generate research on -- restoration techniques (e.g., natural and assisted regeneration, traditional knowledge) tailored to the candidate landscape.',
      questionText: '• Does diverse local knowledge exist (including Indigenous, traditional ecological knowledge, and gender-informed knowledge) on how to implement restoration at scale in the target landscape?',
      considerations: '• Local expertise can come from traditional knowledge from communities living in or around the landscape, experts from universities and rural extension services, and nongovernmental organizations active in the field.\n• The know-how may be generated locally or might be imported from elsewhere but should be communicated or delivered by local practitioners. "Best practice" guidance on restoration may be available from universities, nongovernmental organizations, or extension agencies, as well as from local individuals or groups with long-term restoration expertise.',
      followUpQuestions: '• If "no", then what are the most important knowledge gaps?',
      strategyExamples: '• Create programs on ecosystem restoration in universities and agriculture schools.\n• Prioritize ecosystem restoration in public and private research grant-making programs.\n• Build bridges between researchers and restoration practitioners so the former generate actionable research that is applied in the landscape.',
      sortOrder: 24
    },
    {
      questionCode: '25',
      theme: Theme.ENABLE,
      enablingCondition: 'k. Knowledge',
      keySuccessFactor: '25. Restoration "know how" is transferred via peers or extension services',
      definition: 'Technical assistance and rural extension ("extension services"), farmer-to-farmer visits, women\'s groups, local networks and/or other means of awareness raising and capacity building for restoration are in place and adequately resourced in the candidate landscape.',
      questionText: '• Are extension services, farmer-to-farmer visits, women\'s groups, local networks and/or other means of awareness raising and capacity building for restoration in place, and adequately resourced in the target landscape or at national level?',
      considerations: '• Knowledge sharing may be documented in formal extension services like field visits, training programs, field schools, printed materials and demonstration sites.\n• Consider whether informal learning groups on restoration are sharing information or coordinating activities, including women\'s groups, producer associations, or knowledge exchange among Indigenous Peoples. This "Farmer-to-farmer" or "land-manager-to-land-manager" communication can be one of the most effective means of education and training.\n• Local networks or partnerships for capacity building on ecosystem restoration, agroforestry, or reforestation may be reported in national documents or reports by nongovernmental organizations.',
      followUpQuestions: '• For the candidate landscape, which entities are best positioned to deliver extension services?',
      strategyExamples: '• Facilitate farmer-to-farmer meetings and interaction regarding restoration.\n• Set key performance indicators related to ecosystem restoration for extension agents.\n• Increase funding for ecosystem restoration training within extension services.\n• Include restoration technical assistance as part of agriculture financing packages to farmers.\n• Utilize modern information and communication technologies to better connect extension agents and land managers, and to provide both with the most up-to-date research and information.',
      sortOrder: 25
    },
    {
      questionCode: '26',
      theme: Theme.ENABLE,
      enablingCondition: 'l.Technical design',
      keySuccessFactor: '26. Restoration design is technically grounded and climate resilient',
      definition: 'The landscape restoration plan for the candidate landscape is based on best practices for design, implementation, and maintenance of restoration actvities. The landscape restoration plan incorporates the best available science and climate resilient approaches that ensure the intervention, including aspects such as species selection and restoration techniques, is appropriate for the local context and goals of the intervention, and reduce vulnerability of the restoration intervention to climate impacts such as drought, flood, wildfires, and extreme temperatures.',
      questionText: '• Is the restoration plan for the target landscape based on best practices, incorporating the best available science, traditional ecological knowledge, and climate resilient approaches?',
      considerations: '• Consider whether the approaches for ecosystem restoration are supported by scientific research, local knowledge, or Indigenous practices for recovering natural ecosystems and reducing vulnerability to climate impacts. • Technical design should address aspects such as site preparation, slope, species selection, tree spacing, and maintenance, or how to remove pressures preventing natural vegetation from regrowing (e.g., livestock, fire).\n• Restoration plans should factor in projected climate impacts in order to be climate resilient.',
      followUpQuestions: '• If "no", then what is missing from the plan?',
      strategyExamples: '• Develop an ecosystem restoration plan informed by the best science and factoring in climate change.\n• Review restoration plans of successful restoration experiences elsewhere to gain insights on best practice.',
      sortOrder: 26
    },
    {
      questionCode: '27',
      theme: Theme.ENABLE,
      enablingCondition: 'l.Technical design',
      keySuccessFactor: '27. Restoration limits "leakage"',
      definition: 'Ecosystem restoration in the candidate landscape avoids transferring land clearing activities to other locations ("leakage"), resulting in net increase of restored area.',
      questionText: '• Does the restoration process have provisions in place (e.g., policies, practices, incentives, yield improvements) that limit leakage or is unfolding in a manner that reduces leakage? Do restoration activities avoid displacement of landusers to other areas where they have no option but to transform/clear natural ecosystems for agricultural land uses?',
      considerations: '• There is a risk that ecosystem restoration in the target landscape could result in displacing the activities that were causing land degradation to some other landscape.\n• While such "leakage" might result in an increase in the amount of restored area in the target landscape, it would result in an increase of degraded or deforested lands elsewhere.\n• Ways to limit leakage of restoration activities could include: Combining restoration with productive uses (e.g., agroforestry), providing local livelihood alternatives that do not require converting lands into agriculture, increasing agricultural efficiency so output doesn\'t move to new areas, planning restoration at the landscape level to manage where activities shift and addressing underlying drivers of degradation.\n• For more information on reforestation in one country displacing deforestation to another country to another see: Meyfroidt and Lambin (2011).',
      followUpQuestions: '• If "no", then what measures are missing from the restoration process to avoid displacement of land degradation to other areas?',
      strategyExamples: '• Introduce measures that increase the productivity per hectare of crops, livestock, or timber from existing agricultural and forestry lands\n• Introduce measures that decrease demand for crops, livestock, or timber',
      sortOrder: 27
    },
    {
      questionCode: '28',
      theme: Theme.ENABLE,
      enablingCondition: 'm. Finance and incentives',
      keySuccessFactor: '28. Positive incentives and funds for restoration outweigh negative incentives',
      definition: 'From the perspective of relevant stakeholders, financial incentives and funding mechanisms to support restoration in the candidate area are available, accessible, and sufficiently attractive to encourage investment in restoration activities. These incentives are designed to offset opportunity costs and financial risks associated with restoration, and to outweigh competing incentives that favor land uses or practices that hinder or delay ecosystem recovery. The overall incentive framework supports sustained engagement in restoration over the long term.',
      questionText: '• From the perspective of relevant stakeholders, do available financial incentives and funding mechanisms sufficiently encourage restoration in the target landscape, relative to incentives that may discourage or impede ecosystem recovery?',
      considerations: '• Restoration can occur when overall incentives outweigh both the costs of restoration and the ongoing benefits occurring on the degraded landscape.\n• "Positive" incentives (e.g., grants, loans, tax breaks, subsidies, ecosystem service payments, private goods and services) encourage restoration, while "negative" incentives (e.g., subsidies for livestock, agriculture, or extractive industries) discourage restoration.\n• If the positive incentives are overshadowed by negative incentives, large-scale restoration is unlikely; and both the amount and timing of incentives matter.\n• Incentives and finance are part of implementation because they directly affect land managers\' decisions to restore.',
      followUpQuestions: '• What are the key positive and negative incentives influencing restoration and land-use decisions in the target landscape?\n• From the perspective of relevant stakeholders, what is the magnitude or scale of these incentives (e.g., financial value per hectare or comparable measures)?',
      strategyExamples: '• Introduce ecosystem restoration-dedicated financing mechanisms, such as:\n- Grants\n- Low-interest loans\n- Tax breaks (on the inputs, outputs, or financing of restoration)\n- Direct government expenditures\n- Government procurement policies\n- Payments for ecosystem services (e.g., water, carbon)\n• Remove or reduce incentives that discourage forest or tree regrowth',
      sortOrder: 28
    },
    {
      questionCode: '29',
      theme: Theme.ENABLE,
      enablingCondition: 'm. Finance and incentives',
      keySuccessFactor: '29. Finance is available for restoration actions',
      definition: 'Financial mechanisms and incentives have been thoughtfully designed, selected, and implemented to effectively support restoration policies, actions, and measures at both landscape and community scales. These mechanisms are accessible to a wide range of stakeholders, promote equitable participation, and leverage private sector finance where appropriate to enhance and sustain restoration outcomes.',
      questionText: 'Are financial incentives and funding mechanisms designed to promote restoration in the target area accessible, inclusive, and usable by a diverse range of stakeholders, including local communities?',
      considerations: '• Incentives and funds include grants, loans, tax breaks on the inputs, outputs, or financing of restoration, direct government expenditures like subsidies or procurement policies, payments for ecosystem services, or private markets for goods and services that encourage ecosystem restoration efforts.\n• Consider whether individuals, communities, or groups in the restoration landscape(s) have applied to and received financial support for restoration activities. Include feedback from the individuals or groups who have tried to access these incentives or funds but were not successful.',
      followUpQuestions: '• If "no", then what are the barriers to access?',
      strategyExamples: '• Actively communicate and publicize the availability of financial incentives and funding opportunities through accessible and targeted outreach.\n• Provide technical and administrative assistance to stakeholders and land users to support application, compliance, and reporting processes.\n• Simplify application procedures and reduce administrative and documentation requirements to lower barriers to accessing incentives and funds.',
      sortOrder: 29
    },

    // IMPLEMENT Theme (2 questions)
    {
      questionCode: '30',
      theme: Theme.IMPLEMENT,
      enablingCondition: 'n. Feedback',
      keySuccessFactor: '30. Effective monitoring and evaluation system is in place',
      definition: 'A system for monitoring progress and evaluating impact of restoration in the candidate landscape exists.',
      questionText: 'Is there a monitoring system in place for tracking and evaluating restoration progress at the relevant landscape or national level, and does it align with the national and global monitoring systems?',
      considerations: '• Information for monitoring and evaluation should be gathered in a planned, ongoing way to provide insight and feedback on the implementation of restoration activities. Aspects to monitor may include hectares under restoration, survival rates of planted species, quantified economic and social benefits, and ecosystem service flows.\n• Monitoring and evaluation systems may employ approaches such as remote sensing, crowd-sourced ground-level monitoring (e.g., using community, volunteers, and communication technologies), and surveys of inhabitants of the target landscape.',
      followUpQuestions: '• If "yes", is baseline data already being gathered?\n• If "no", what aspects of a performance monitoring system are missing?',
      strategyExamples: '• Whenever possible, establish a baseline (e.g., photos, satellite imagery, data on hectares and other measurements from the landscape as it is) to enable comparisons over time.\n• Develop and implement a performance monitoring system (including remote sensing monitoring and ground-level participatory monitoring).',
      sortOrder: 30
    },
    {
      questionCode: '31',
      theme: Theme.IMPLEMENT,
      enablingCondition: 'n. Feedback',
      keySuccessFactor: '31.Early and ongoing suceesses are communicated',
      definition: 'Key successes in restoring the candidate landscape are promptly shared with stakeholders, ensuring they are informed of the progress and fostering a sense of partnership and engagement.',
      questionText: '• Are restoration successes being communicated in the target landscape and the target audience being identified?',
      considerations: '• Communication may take the form of documentation and story coverage in media campaigns and social media, but may also include direct observation via visits of farmers, land managers, and decision makers to restoration sites.\n• Achieving and publicly communicating success, including "early wins" can help maintain momentum, recruit more engagement, trigger replication elsewhere in the landscape, shore up political support, and sustain external financing.',
      followUpQuestions: '• If "yes", how are the successes communicated (e.g., through what media)?\n• If "no", what media are available that could be utilized?',
      strategyExamples: '• Publicly communicate restoration progress, success stories, and lessons learned. Ensure the stories connect with the target audiences (e.g., images of progress, stories of benefits to people).',
      sortOrder: 31
    }
  ];

  // Insert questions
  for (const q of questions) {
    const question = questionRepo.create({
      ...q,
      diagnosticId: diagnostic.id
    });
    await questionRepo.save(question);
  }

  console.log(`✅ Created ${questions.length} questions`);
  console.log('✅ Diagnostic seed complete');
}

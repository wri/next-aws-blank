import { AppDataSource } from '../data-source'
import { Diagnostic } from '../entities/Diagnostic.entity'
import { Question, Theme } from '../entities/Question.entity'
import {
  sanitizeText,
  sanitizeQuestionText,
  parseFollowUpQuestions,
} from './utils/sanitize-text'

/**
 * Seed Diagnostic Questions
 * 
 * Seeds all 31 key success factors for ecosystem restoration diagnostic
 * Distribution: 8 Motivate (1-8), 13 Enable (9-21), 9 Implement (22-31)
 * 
 * Data source: Restoration-Diagnostic-Tool-key-factors-update-feb-16-2006.csv
 */
export async function seedDiagnosticWithQuestions(): Promise<void> {
  console.log('🌱 Starting diagnostic questions seed...')

const queryRunner = AppDataSource.createQueryRunner()
  await queryRunner.connect()

  try {
    await queryRunner.startTransaction()

    const diagnosticRepo = queryRunner.manager.getRepository(Diagnostic)
    const questionRepo = queryRunner.manager.getRepository(Question)

    // Find or create the main diagnostic
    let diagnostic = await diagnosticRepo.findOne({
      where: { version: 'v1.0.0', language: 'en' },
    })

    if (!diagnostic) {
      console.log('📋 Creating diagnostic v1.0.0...')
      diagnostic = diagnosticRepo.create({
        title: 'Restoration Diagnostic Tool',
        description: 'A comprehensive assessment tool for evaluating landscape restoration readiness and success factors',
        version: 'v1.0.0',
        language: 'en',
      })
      await diagnosticRepo.save(diagnostic)
      console.log(`✅ Created diagnostic: ${diagnostic.id}`)
    } else {
      console.log(`✅ Found existing diagnostic: ${diagnostic.id}`)
    }

    // Define all 31 questions with their data
    const questionsData: Array<{
      questionCode: string
      theme: Theme
      enablingCondition: string
      minimalKeySuccessFactor: string
      keySuccessFactor: string
      questionText: string
      definition: string | null
      considerations: string | null
      followUpQuestions: string | null
      strategyExamples: string | null
      sortOrder: number
    }> = [
      // MOTIVATE (1-8)
      {
        questionCode: 'M01',
        theme: Theme.MOTIVATE,
        enablingCondition: 'Benefits',
        minimalKeySuccessFactor: 'Economic',
        keySuccessFactor: 'Restoration generates economic benefits',
        questionText: sanitizeQuestionText('Is restoring the target area expected to generate economic benefits that result in a net positive financial or economy-wide economic impact relative to the status quo land use?'),
        definition: sanitizeText('Restoring the candidate area is expected to yield economic benefits (e.g., economic diversification, avoided damages, new marketable products) that create a net positive financial impact (private benefits) and/or net positive economy-wide impact (public benefits) relative to the status quo land use. Side note: economic impacts referring to environmental benefits that function as public goods, or to economy-wide economic impacts that capture restoration-related spillovers across value chains and the broader economy, including GDP growth and employment. Such impacts typically arise from economic benefits like diversification, avoided damages, and new market products enabled by restoration.'),
        considerations: sanitizeText('Economic benefits from restoration are the overall positive outcomes for income or finance that result from implementing restoration activities versus a business-as-usual scenario.\nExamples of economic benefits include increased income, improved entrepreneurship opportunities, increased production of key commodities, or new employment opportunities that result from restoration efforts. A more complete list of possible benefits is included in this tool in the Restoration Benefits table.\nThe timeframe of this answer should consider the timeframe of the anticipated restoration activities, recognizing that restoration processes and their benefits occur over the long-term.\nMake note of which individuals or groups would likely receive these benefits.\nSome landowners may be concerned that restoration means they will lose their land, user rights, or income relative to the status quo. Therefore, the answer to this question can be supported with documents that show how the net benefits outweigh the costs. Side note: formalized land rights might emerge as a positive co-benefit of the restoration project. In some cases, implementing the project and disbursing finance to support restoration activities may require clear land rights to be clearly defined. Consequently, this could accelerate demarcation processes and enable local communities to obtain legal title to their land.'),
        followUpQuestions: parseFollowUpQuestions('If yes, then what are the expected economic benefits?\nIf yes, then who benefits?\nIf no, then how big is the expected financial or economic gap?'),
        strategyExamples: sanitizeText('Conduct a benefit-cost analysis comparing (a) likely benefits generated from the restored landscape, (b) likely costs of restoring the target landscape, and (c) likely costs and benefits of the status quo use of the landscape.'),
        sortOrder: 1,
      },
      {
        questionCode: 'M02',
        theme: Theme.MOTIVATE,
        enablingCondition: 'Benefits',
        minimalKeySuccessFactor: 'Social',
        keySuccessFactor: 'Restoration generates social benefits',
        questionText: sanitizeQuestionText('Is restoring the target area expected to generate social, cultural, or political benefits for the people living in that area, including vulnerable groups such as women, youth and Indigenous people?'),
        definition: sanitizeText('Restoring the target area is expected to improve livelihoods, elevate the social or political standing of vulnerable populations, safeguard or restore natural cultural heritage sites or the use of culturally significant practices, or yield other social, cultural, and/or political benefits for the local population.'),
        considerations: sanitizeText('Review the list of possible social benefits in the "Restoration Benefits" table found in the supporting materials for this tool. For example, restoration activities may result in benefits that are social, cultural or political in nature, such as increased visibility of cultural values, recognition of traditional ecological knowledge, achievement of political gains, increased recreational opportunities, or improvements in gender equity. Restoration can also be a way for governments to be seen as leaders on the global stage and achieve commitments to international agreements (e.g., UNFCCC, UNCCD, UNCBD, REDD+, SDGs). Furthermore, restoration can be beneficial to countries or communities with a historical cultural connection to forests or other ecosystems (e.g., forest-based traditions and folklore, ecosystem-based livelihoods and employment).\nConsider whether the benefits list in the table are recognized or considered in restoration plans, programs, or activities in the target landscape.\nMake note of which individuals or groups would likely receive these benefits.'),
        followUpQuestions: parseFollowUpQuestions('If yes, what are the expected social benefits?'),
        strategyExamples: sanitizeText('Engage communities living in and around the target landscape to identify their social, political, or cultural goals and priorities. This could be done through surveys or in-person workshops. Based on this exercise, co-create a map of restoration interventions that could help achieve these goals.\nValidate existing restoration plans, financing instruments, monitoring systems, and indicators with local communities, including representatives from vulnerable populations, to ensure plans serve community needs.'),
        sortOrder: 2,
      },
      {
        questionCode: 'M03',
        theme: Theme.MOTIVATE,
        enablingCondition: 'Awareness',
        minimalKeySuccessFactor: 'Environmental',
        keySuccessFactor: 'Restoration generates environmental benefits',
        questionText: sanitizeQuestionText('Is restoring the target area expected to generate environmental benefits?'),
        definition: sanitizeText('Restoring the target area is expected to generate substantial and long-term environmental benefits, including the conservation and recovery of biodiversity, enhanced climate change mitigation and adaptation, reduced land degradation and desertification, and the restoration of vital ecosystem services such as water regulation, soil fertility, and carbon sequestration. These improvements will contribute to increased ecological resilience and sustainable livelihoods over time.'),
        considerations: sanitizeText('Examples of environmental benefits include enhanced biodiversity, improved watershed security, strengthened climate change mitigation and adaptation, and increased soil fertility, among others. A more comprehensive overview of anticipated environmental benefits is provided in the supporting materials for this diagnostic, in the Restoration Benefits table.'),
        followUpQuestions: parseFollowUpQuestions('If yes, then what are the expected environmental benefits?'),
        strategyExamples: sanitizeText('Engage scientists (e.g., biologists, ecologists, hydrologists, soil scientists) to identify which environmental benefits could be generated from restoration efforts.'),
        sortOrder: 3,
      },
      {
        questionCode: 'M04',
        theme: Theme.MOTIVATE,
        enablingCondition: 'Awareness',
        minimalKeySuccessFactor: 'Public communication',
        keySuccessFactor: 'Benefits of restoration are publicly communicated',
        questionText: sanitizeQuestionText('Are the benefits of restoring the target area communicated to all stakeholders, including vulnerable groups, and communication channels designed to reach these diverse stakeholders?'),
        definition: sanitizeText('The benefits of restoring the target landscape have been clearly communicated to land managers, vulnerable groups, and other relevant stakeholders'),
        considerations: sanitizeText('Communication may be through various channels, including articles, press, social media, radio and television, demonstration visits, street plays or other pathways that target relevant stakeholders and decision makers.\nPeer-to-peer communication of restoration benefits can be an effective means of raising awareness and motivating action.\nConsider whether this communication is organized as part of a larger stakeholder engagement strategy.\nA more complete list of benefits is included in the supporting materials to diagnostic in the Restoration Benefits table.'),
        followUpQuestions: parseFollowUpQuestions('What benefits might arise?\nHow has the communication specifically targeted or included key stakeholders?'),
        strategyExamples: sanitizeText('Produce awareness-raising materials and campaigns via newspapers, radio, television, internet, and/or site visits, depending on the target audience\nIntroduce and/or leverage existing national restoration activities such as public or school tree planting programs.'),
        sortOrder: 4,
      },
      {
        questionCode: 'M05',
        theme: Theme.MOTIVATE,
        enablingCondition: 'Awareness',
        minimalKeySuccessFactor: 'Opportunities',
        keySuccessFactor: 'Opportunities for restoration are identified',
        questionText: sanitizeQuestionText('Have target or priority areas for restoration been identified and quantified?'),
        definition: sanitizeText('Candidate areas for restoration have been identified and quantified.'),
        considerations: sanitizeText('Target areas for restoration are the places where restoration efforts should occur based on a combination of environmental, social, and economic considerations.\nInformation on these opportunities may be presented in national or subnational maps and/or restoration strategies, and should be consistent with the areas that government agencies use when allocating funding, programs, planning resources for restoration.\nConsider whether stakeholders recognize and reference the same priority levels.'),
        followUpQuestions: parseFollowUpQuestions('If yes, then where are the candidate areas?\nIf yes, then how big is the restoration opportunity?'),
        strategyExamples: sanitizeText('Conduct a Restoration Opportunities Assessment Methodology planning activity. This is a comprehensive restoration planning resource available online https://iucn.org/resources/grey-literature/guide-restoration-opportunities-assessment-methodology-roam'),
        sortOrder: 5,
      },
      {
        questionCode: 'M06',
        theme: Theme.MOTIVATE,
        enablingCondition: 'Crisis events',
        minimalKeySuccessFactor: 'Crisis events',
        keySuccessFactor: 'Crisis events are leveraged',
        questionText: sanitizeQuestionText('Is the target area experiencing a crisis event, or the risk of one in the future, that would motivate restoration in the target landscape, and how could those events affect the different groups of population (rural and peasants, urban, indigenous, women, youth, etc)?'),
        definition: sanitizeText('The government and/or civil society use the risk or occasion of crisis events to build political and public support for ecosystem restoration.'),
        considerations: sanitizeText('Crisis events can include floods, landslides, droughts, fires, sandstorms, wood shortages, declining crop yields, and unemployment, among others. Crises can include humanitarian catastrophes where damage could have been avoided if natural ecosystems were intact (e.g., a landslide), where the act of restoration could address the crisis (e.g., unemployment), or where restoration prevents future crises (e.g., floods).\nOne does not desire these events to occur. But when they do occur, restoration supporters should act quickly to mobilize political and community support for restoration.\nIn the context of climate change and resilience, be sure to consider both past climate impacts as well as future scenarios and to plan accordingly, where thresholds must now be calculated more broadly.'),
        followUpQuestions: parseFollowUpQuestions('What types of crises have occurred in the target landscape in the past?\nWhat types of crises could occur in the future?'),
        strategyExamples: sanitizeText('Conduct and communicate research that quantifies and visualizes the extent to which restored ecosystems can prevent or mitigate natural humanitarian disasters and save money on mitigation efforts when proper planning and prevention are implemented.\nWhen disasters occur, immediately publicly communicate the benefits of restoration.'),
        sortOrder: 6,
      },
      {
        questionCode: 'M07',
        theme: Theme.MOTIVATE,
        enablingCondition: 'Legal requirements',
        minimalKeySuccessFactor: 'Laws & policies exist',
        keySuccessFactor: 'Laws and policies requiring restoration exist',
        questionText: sanitizeQuestionText('Are law or policies in place requiring land owners or managers to replant or restore ecosystems in areas that have been cleared (e.g., forests, grasslands, wetlands)?'),
        definition: sanitizeText('The government has legislation and policies that require land managers to allow for recovery of natural vegetation or to replant trees in natural ecosystems that have been cleared in the candidate landscape.'),
        considerations: sanitizeText('Consider whether legislation specifically mandates restoration, such as requirements for reforestation, obligations to rehabilitate land, or restoration regulations on extractive activities. Do these laws and policies specify who is required to restore, in what situations, and over what timeframes? Does this legal framework apply over the full boundaries of the target landscape? (I.e., are the requirements national in scope?)\nRestoration requirements are more commonly directed at entities involved with commercial logging, mining, or other extractive activities than for subsistence activities.'),
        followUpQuestions: parseFollowUpQuestions('If yes, what specific terms and conditions does the law have (e.g., what to restore, by when, how)?'),
        strategyExamples: sanitizeText('Establish government law (or industry policy) that requires land managers to allow vegetation recovery or to replant vegetation in areas that have been cleared due to their own commercial activity (e.g., logging, mining, etc.).'),
        sortOrder: 7,
      },
      {
        questionCode: 'M08',
        theme: Theme.MOTIVATE,
        enablingCondition: 'Legal requirements',
        minimalKeySuccessFactor: 'Laws & policies understood',
        keySuccessFactor: 'Laws and policies requiring restoration are broadly understood and enforced',
        questionText: sanitizeQuestionText('Is the law or policy requiring ecosystem restoration enforced in a visible, credible, and fair manner and broadly understood by all relevant actors, including vulnerable groups?'),
        definition: sanitizeText('The laws and policies requiring tree recovery or replanting in the target landscape are understood by relevant actors and are enforced in a visible, credible, and fair manner.'),
        considerations: sanitizeText('It is not sufficient that a law requiring restoration merely exists; the law needs to be enforced fairly and understood by affected entities and enforced by authorities if it is to motivate restoration.\nConsider whether the legal requirements for landscape restoration are communicated to key stakeholders and complemented by actions like communication campaigns, enforcement efforts (e.g., fines) for violation of restoration requirements, and ensuring adequate human and financial resources for enforcement.\nGovernment mandates for restoration can trigger sensitivities about government involvement in land-use decisions that otherwise would be the purview of traditional communities or private landowners. Therefore, how legal requirements are communicated and complemented by other policies, incentives, and practices can be important for the success of the requirement.'),
        followUpQuestions: parseFollowUpQuestions('It is not sufficient that a law requiring restoration merely exists; the law needs to be understood by affected entities and enforced by authorities if it is to motivate restoration.'),
        strategyExamples: sanitizeText('Conduct communication campaign to make relevant actors aware of restoration requirements.\nTake enforcement action (e.g., fines, denial of credit access, jail) against violations of restoration requirements.\nEnsure human and financial resources for enforcement are adequate.'),
        sortOrder: 8,
      },
      // ENABLE (9-21)
      {
        questionCode: 'E01',
        theme: Theme.ENABLE,
        enablingCondition: 'Ecological conditions',
        minimalKeySuccessFactor: 'Soil, water climate & fire',
        keySuccessFactor: 'Soil, water, climate, and fire conditions are suitable for restoration',
        questionText: sanitizeQuestionText('Are the target landscape\'s soil, rainfall, temperature, and fire and management conditions suitable for enabling growth and survival or planted or naturally regenerating vegetation?'),
        definition: sanitizeText('The target landscape\'s soil, rainfall, and temperature conditions are suitable for regrowth of natural vegetation, and the fire regime does not hinder recovery of natural ecosystems.'),
        considerations: sanitizeText('This key factor combines multiple ecological conditions affecting ecosystem restoration. Each condition (soil, rainfall, temperature, fire) should be evaluated on its own, yet the response can reflect the aggregate of the four.'),
        followUpQuestions: parseFollowUpQuestions('If no, then what are the gaps in physical suitability? Are efforts to overcome these constraints feasible?'),
        strategyExamples: sanitizeText('Adaptively manage or adjust restoration plan (e.g., species mix) to match water and climate regime of landscape.\nLaunch program to prevent unwanted fires or introduce prescribed fires\nLaunch program to improve soil quality (e.g., plant nitrogen-fixing species).\nCreate bunds or half-moons to store water after rains'),
        sortOrder: 9,
      },
      {
        questionCode: 'E02',
        theme: Theme.ENABLE,
        enablingCondition: 'Ecological conditions',
        minimalKeySuccessFactor: 'Invasive species',
        keySuccessFactor: 'Plants and animals that can impede restoration are minimized',
        questionText: sanitizeQuestionText('Can unwanted invasive plants and animals that hinder ecosystem recovery be effectively removed or controlled In the target landscape and restoration sites?'),
        definition: sanitizeText('Persistent invasive species in the target landscape can be managed or controlled to avoid interference with replanted or naturally regenerating vegetation. Restoration sites can be protected from grazing livestock that impede ecosystem recovery.'),
        considerations: sanitizeText('Consider whether there are monitoring or control measures (fencing, weed management, removal) in place to manage problematic or invasive species that can outcompete or exclude species used for restoration.\nLandscapes may be free of unwanted plants and/or unwanted animals either because none ever existed naturally in the landscape or because they have been successfully minimized through management.\nExamples of species that can impede restoration efforts include Brachiaria spp. in Brazil, Imperata cylindrica in Indonesia, Pueraria montana (kudzu) in southern United States, and uncontrolled grazing animals (cattle, sheep, goats) in multiple locations.'),
        followUpQuestions: parseFollowUpQuestions('If no, then what are the persistent plant and/or animal species and how do they affect ecosystem restoration?'),
        strategyExamples: sanitizeText('Implement program to remove invasive plants (e.g., using fast-growing native trees to shade out invasives, using goats, appropriate use of fire).\nImplement program to exclude unwanted roaming livestock (e.g., incentives and training for fences).'),
        sortOrder: 10,
      },
      {
        questionCode: 'E03',
        theme: Theme.ENABLE,
        enablingCondition: 'Ecological conditions',
        minimalKeySuccessFactor: 'Source populations',
        keySuccessFactor: 'Native seeds, seedlings, or source populations are readily available',
        questionText: sanitizeQuestionText('Does the target landscape have source populations, soil propagules bank (such as underground root systems and seed banks), or low-cost sources of native seeds and seedlings that can be the foundation for ecosystem recovery?'),
        definition: sanitizeText('The target landscape has natural sources that support regeneration, such as nearby natural areas, regrowth from underground roots, animal-dispersed seeds, and easy access to low-cost native seeds and seedlings that support ecosystem recovery.'),
        considerations: sanitizeText('Viable source populations or soil propagules bank of native plants are critically important for passive restoration.\nThis key success factor applies to the entire supply chain for native seeds and seedling, including seed production, seed collection and processing, and seedling nurseries.'),
        followUpQuestions: parseFollowUpQuestions('If no, then where is the gap (e.g., seeds, seed collectors, nurseries, source populations, soil propagules banks?'),
        strategyExamples: sanitizeText('Establish laws protecting remaining tracts of native vegetation in candidate landscape.\nCreate financial incentives and capacity-building programs aimed at strengthening and increasing the number and quality of seedling nurseries and seed collector networks.'),
        sortOrder: 11,
      },
      {
        questionCode: 'E04',
        theme: Theme.ENABLE,
        enablingCondition: 'Economic conditions',
        minimalKeySuccessFactor: 'Competing demands',
        keySuccessFactor: 'Competing economic demands for land (e.g., food, fuel) that drive land degradation are being managed',
        questionText: sanitizeQuestionText('Are the economic pressures from crop, livestock, fuelwood, and/or biofuel production on degraded lands and natural ecosystems declining in the target landscape?'),
        definition: sanitizeText('Demand for crop, livestock, fuel wood, and/or biofuel production on degraded or natural ecosystems in the target landscape is declining (e.g., due to productivity improvements elsewhere), thereby reducing pressures that drive land degradation and freeing up opportunities for restoration.'),
        considerations: sanitizeText('Competing land-use pressures may come from agricultural expansion, infrastructure development, livestock grazing, fuel wood and urbanization.\nThis key success factor is arguably one of the most important in light of increasing global demand for land to produce crops, livestock, and biofuel (Searchinger et al. 2013).\nThis key factor would not apply when land is restored into agroforestry or silvopastoral systems which continue to produce crops and livestock, respectively.'),
        followUpQuestions: parseFollowUpQuestions('What are the main alternative competing land uses for the candidate areas to be restored?'),
        strategyExamples: sanitizeText('Pursue technical and financial measures to increase the productivity (yields per hectare) of crops and livestock on existing nonmarginal agricultural land.\nPursue technical and financial measures to increase the supply of timber and agricultural products and of nonbiomass renewable energy from restored landscapes.\nAvoid establishing bioenergy targets that could lead to degraded or former forestlands being converted to biomass plantations.\nDo financial measures include policy incentives? A key strategy to address this economic pressure is to redirect incentives away from harmful land-use activities and toward regenerative agricultural practices.'),
        sortOrder: 12,
      },
      {
        questionCode: 'E05',
        theme: Theme.ENABLE,
        enablingCondition: 'Economic conditions',
        minimalKeySuccessFactor: 'Value chains',
        keySuccessFactor: 'Value chains and/or market exist for commodity products (timber, agricultural products) and environmental products (carbon, water, biodiversity) from restored areas',
        questionText: sanitizeQuestionText('Are value chains in place allowing products from restored land to reach end consumers?'),
        definition: sanitizeText('To the degree that forest restoration in the target landscape generates marketable products and services, value chains are in place allowing these products to get from the restored forest to the end consumer.'),
        considerations: sanitizeText('This key success factor refers to both market access and market demand for products and services derived from restored forest landscapes. A value chain describes the multiple steps involved in offering a product or service such as harvesting, collection, processing, transportation, and distribution. A value chain from restoration suggests that individuals or groups in the target landscape can derive livelihoods and local economic activities as a part of restoring ecosystems.\nConsider if there are initiatives, cooperatives or businesses in the target landscapes that sell products or services as a result of restoration activities. Are producers in these places able to differentiate their products and services through labels, certifications, or access to preferred markets? Is there infrastructure for processing and aggregating the products and services offered from the target landscapes?\nServices from restored ecosystems could include recreation, tourism, and water provisioning.'),
        followUpQuestions: parseFollowUpQuestions('If no, then where are the gaps in such a value chain?\nIf yes, what is the value chain, including the producers, intermediaries, final consumers, etc.'),
        strategyExamples: sanitizeText('Encourage growth of markets (both supply and demand) for commodity products (timber, agricultural products) and environmental products (carbon, water, biodiversity) derived from restored landscapes.\nProvide low-interest financing for businesses directly involved in the restoration value chain.'),
        sortOrder: 13,
      },
      {
        questionCode: 'E06',
        theme: Theme.ENABLE,
        enablingCondition: 'Policy conditions',
        minimalKeySuccessFactor: 'Land & natural resources',
        keySuccessFactor: 'Land users, landholders or communities hold secure tenure rights to land and natural resources on the land',
        questionText: sanitizeQuestionText('Do those who manage the target landscape have clear and secure rights to use land, harvest products sustainably, and receive financial benefits that would accrue from restoration? Are these rights accessible to all stakeholders, including women and vulnerable groups?'),
        definition: sanitizeText('People and communities who manage the target landscape have clear and secure rights (e.g., in the form of land ownership or natural resource management rights) to the benefits that would accrue from restoration.'),
        considerations: sanitizeText('Lack of (or insecure) land tenure and natural resource rights in the target landscape can discourage restoration that involves human intervention. People will not invest in planting trees and native vegetation or allow natural regeneration on lands they manage if they are unlikely benefit from the restored state.\nTenure and natural resource rights can take the form of private land ownership, communal lands, customary agreements, user-right certificates, etc.\nAlso consider whether the tenure that is in place overlaps or conflicts with customary rights.'),
        followUpQuestions: parseFollowUpQuestions('If no, then what rights are missing, and for whom?'),
        strategyExamples: sanitizeText('Reform policies to ensure that land managers have clear and secure rights to land and the natural resources (e.g., trees) on their land.'),
        sortOrder: 14,
      },
      {
        questionCode: 'E07',
        theme: Theme.ENABLE,
        enablingCondition: 'Policy conditions',
        minimalKeySuccessFactor: 'Policies',
        keySuccessFactor: 'Policies affecting restoration are harmonized and streamlined',
        questionText: sanitizeQuestionText('Are policies that may could impact restoration in the target landscape aligned and streamlined at a global, national, subnational and local context?'),
        definition: sanitizeText('Relevant public policies are aligned, coherent, and streamlined to effectively support restoration efforts in the target area. These policies are mutually reinforcing, minimize unnecessary administrative barriers, and create an enabling environment for implementation. Policies that promote gender equality and social inclusion are also considered integral to supporting inclusive and sustainable restoration outcomes.'),
        considerations: sanitizeText('National policies on climate, biodiversity, and land degradation will likely have points of overlap for restoration that can be considered through existing national committees.\nOther policies to consider include those on agriculture, extractive industries, water, land use planning, infrastructure and natural resources.\nIn some cases, policies for nature conservation or other sectors may inhibit restoration (e.g., laws forbidding extraction of native seeds from protected areas, laws forbidding harvesting native tree species, subsidies that encourage to drivers of degradation).'),
        followUpQuestions: parseFollowUpQuestions('If no, then which policies are not aligned or streamlined?'),
        strategyExamples: sanitizeText('Conduct an assessment to identify existing policies that might impact the efficacy and efficiency of ecosystem restoration, determine whether or not each is mutually supportive, and recommend policy reforms to achieve greater alignment.'),
        sortOrder: 15,
      },
      {
        questionCode: 'E08',
        theme: Theme.ENABLE,
        enablingCondition: 'Policy conditions',
        minimalKeySuccessFactor: 'Clearing restrictions exist',
        keySuccessFactor: 'Restrictions on clearing remaining natural ecosystems (e.g., forests, grasslands, wetlands) exist',
        questionText: sanitizeQuestionText('Does the target landscape have laws restricting the clearing or cutting of remaining natural ecosystems?'),
        definition: sanitizeText('The target landscape has laws restricting clearing or cutting of remaining natural ecosystems.'),
        considerations: sanitizeText('Restrictions on clearing remaining natural forests and ecosystems can prevent further expansion of degraded or cleared areas. These restrictions also create an incentive to restore the productivity of already cleared areas since opportunities to use the forest frontier are reduced.\nRestrictions can also take the form of an extensive network of national parks and national forests, an extensive network of forested indigenous territories, ecosystem protection rules on communal lands, no net loss rules, specific percentages of land required to remain as forest (e.g., Brazil\'s Forest Code) and more.\nAn important component of this key success factor is that natural forests and ecosystems have been clearly defined by the jurisdiction sponsoring the restriction (e.g., national government). This definition should include primary forests, secondary forests, and degraded forests and other ecosystems with potential for restoration.'),
        followUpQuestions: parseFollowUpQuestions('If yes, then what are those laws?'),
        strategyExamples: sanitizeText('Establish laws that restrict cutting or clearing of remaining natural ecosystems. Establish, strengthen, and enforce legal and regulatory frameworks that restrict the cutting, clearing, or conversion of remaining natural ecosystems, ensuring long-term protection of critical habitats and ecological functions.'),
        sortOrder: 16,
      },
      {
        questionCode: 'E09',
        theme: Theme.ENABLE,
        enablingCondition: 'Policy conditions',
        minimalKeySuccessFactor: 'Clearing restrictions enforced',
        keySuccessFactor: 'Restrictions on clearing remaining natural ecosystems (e.g., forests, grasslands, wetlands) are enforced',
        questionText: sanitizeQuestionText('Are these clearing or cutting restrictions adequately enforced?'),
        definition: sanitizeText('Laws that restrict clearing of remaining natural ecosystems are adequately enforced.'),
        considerations: sanitizeText('It is not sufficient that regulations restricting clearing of remaining natural ecosystems merely exist; the restrictions need to be enforced by relevant authorities.\nParticularly in remote areas, enforcement depends on the capacity of law enforcement organizations and incentives for them to exercise enforcement activities.'),
        followUpQuestions: parseFollowUpQuestions('If no, then why not?'),
        strategyExamples: sanitizeText('Conduct communication campaign to make relevant actors aware of law.\nEstablish a forest cover change monitoring system to identify illegal clearing.\nTake enforcement action (e.g., fines, denial of credit access) against violations of law.\nEnsure human and financial resources for enforcement are adequate.'),
        sortOrder: 17,
      },
      {
        questionCode: 'E10',
        theme: Theme.ENABLE,
        enablingCondition: 'Social and cultural conditions',
        minimalKeySuccessFactor: 'Women, youth, Indigenous Peoples',
        keySuccessFactor: 'Women, youth, and Indigenous Peoples participate in restoration decision making',
        questionText: sanitizeQuestionText('Are women, youth, and Indigenous Peoples living in and around the target area—along with the cultural systems, traditional governance structures, and knowledge systems they represent—meaningfully involved in restoration decision-making (e.g., program design, goal-setting, management, monitoring, and indicator selection)?'),
        definition: sanitizeText('Women, youth, and Indigenous Peoples are explicitly recognized and supported as key participants in restoration planning and implementation at all scales. Their cultural systems, traditional governance structures, and knowledge are respected and integrated into decision-making bodies, governance arrangements, and monitoring processes, ensuring inclusive, representative, and culturally appropriate restoration outcomes.'),
        considerations: sanitizeText('Decision-making related to areas—including planning, design, management, and monitoring—should be inclusive and culturally appropriate. Where participation is limited or extractive, restoration efforts risk fragmented uptake, weakened local ownership, and inequitable distribution of benefits, particularly for women, youth, and Indigenous Peoples.\nLeveraging and strengthening existing local institutions and culturally grounded processes (e.g., village-based forestry cooperatives, women\'s groups, Indigenous Peoples\' organizations, youth associations, and traditional governance systems) can support co-management arrangements, enhance local participation, and increase long-term adoption of restoration efforts.\nRestoration planning and implementation should recognize and respect cultural systems more broadly—including the values, knowledge, and practices of diverse stakeholder groups—and integrate these perspectives into decision-making, management, and monitoring processes.\nEffective and inclusive participation requires transparency and accountability in decision-making, respect for Free, Prior, and Informed Consent (FPIC) where applicable, and accessible, trusted grievance and feedback mechanisms that allow stakeholders to raise concerns and enable course correction when processes or outcomes fall short.'),
        followUpQuestions: parseFollowUpQuestions('If no, then which groups are not well represented?\nIf no, then which aspects of restoration are vulnerable groups left out of or excluded from?'),
        strategyExamples: sanitizeText('Involve representatives from people living in and around the target landscape in the restoration process (e.g., goal-setting, design, implementation, monitoring, and indicator selection) and governance mechanisms (e.g., multi-stakeholder groups).\nCultivate restoration champion from local communities by conducting capacity building efforts or developing financial structures that prioritize community led restoration projects.\nTake inclusive measures (e.g., intercultural or accommodating facilitation methods, open calls, workshops in local languages) to convene and reflect the diverse perspectives of all the people in the landscape\nUse sex disaggregated data when measuring restoration participation, benefits, and other outcomes.'),
        sortOrder: 18,
      },
      {
        questionCode: 'E11',
        theme: Theme.ENABLE,
        enablingCondition: 'Social and cultural conditions',
        minimalKeySuccessFactor: 'Local people benefit',
        keySuccessFactor: 'Local people benefit from restoration',
        questionText: sanitizeQuestionText('Are people living in and around the target area able to capture or enjoy the benefits generated by restoration, such as improved livelihoods or ecosystem services?'),
        definition: sanitizeText('Communities who live in or around the target areas have their needs addressed from restoration efforts and receive environmental benefits (e.g., improved water quality, increased supply of forest products) or economic benefits (e.g., alternate sources of income, improved livelihoods) from restoration.'),
        considerations: sanitizeText('The planning documentation and technical design of any restoration initiative should include frameworks and mechanisms to ensure that people living in or adjacent to the restored area(s) are the primary beneficiaries of the positive outcomes of restoration. Examples of the types of benefits restoration can produce are available here.\nRestoration planners or implementers should continually ask themselves: Among the social, cultural, political, environmental, and economic benefits identified, do restoration plans specify which local people or groups are expected to benefit from restoration activities? Do these benefits correspond with local needs? Are the benefits received by local people in a reasonable, equitable, and reliable way?\nIf local people do not perceive benefits, then they will have little incentive to change behaviors to enable restoration or sustain the restored landscape over the long term.'),
        followUpQuestions: parseFollowUpQuestions('If no, then what barriers or constraints are preventing local communities from accessing the benefits of restoration?'),
        strategyExamples: sanitizeText('Ensure that financial flows for the goods and/or services generated by the restored landscape (e.g., payments for ecosystem services) go to people living in and around the restored landscape.\nDevelop financial structures, such as bonds or outcome-based finance schemes, that reward local communities for restoring their environment.\nCreate participatory monitoring systems that enable local communities to report the benefits of restoration in the near- and long-term and inform future design changes or adjustments.\nAllow local people to harvest some of the forest products from the restored landscape.'),
        sortOrder: 19,
      },
      {
        questionCode: 'E12',
        theme: Theme.ENABLE,
        enablingCondition: 'Institutional conditions',
        minimalKeySuccessFactor: 'Roles & responsibilities',
        keySuccessFactor: 'Roles and responsibilities for restoration are clearly defined',
        questionText: sanitizeQuestionText('Are the roles and responsibilities for ecosystem restoration in the target landscape clearly defined, understood by relevant actors, and accompanied by authority?'),
        definition: sanitizeText('Roles and responsibilities for restoration in the target landscape are clearly defined, understood among relevant actors (e.g., government, civil society, private sector and others relevant stakeholders), and accompanied by authority'),
        considerations: sanitizeText('Consider whether there are designated agencies, institutions, or groups with the power to implement ecosystem restoration.\nIn the absence of clarity on roles and responsibilities, inaction may occur due to important roles not being filled, uncertainty about who does what, or due to institutions and groups claiming overlapping responsibility and rights.\nTo adequately answer this question, users may need to map out existing mandates for restoration planning, coordination, implementation and monitoring among public entities, private groups and organizations, land owners, land users, and other key stakeholders. Roles, responsibilities and rights can also be defined in laws, policies or customary practices.'),
        followUpQuestions: parseFollowUpQuestions('If no, then what is missing in terms of clarity of roles and responsibilities?'),
        strategyExamples: sanitizeText('Create a national, state, local or watershed-level Ecosystem Restoration Platform or Committee that articulates roles and responsibilities among government, civil society, academic, and private sector entities and other relevant stakeholders.'),
        sortOrder: 20,
      },
      {
        questionCode: 'E13',
        theme: Theme.ENABLE,
        enablingCondition: 'Institutional conditions',
        minimalKeySuccessFactor: 'Institutional coordination',
        keySuccessFactor: 'Effective institutional coordination is ongoing',
        questionText: sanitizeQuestionText('Are relevant stakeholders from government, civil society, and the private sector effectively coordinated—such as through a working group or multistakeholder process—to design, implement, and monitor ecosystem restoration in the candidate area, while also ensuring that these efforts are inclusive of vulnerable groups?'),
        definition: sanitizeText('Relevant actors from government, civil society, and/or the private sector are sufficiently coordinated to design, implement, and monitor restoration in the target area.'),
        considerations: sanitizeText('Consider whether public and private institutions have committed to clear leadership and mandates for restoration. Is there demonstrated joint action in the form of coordination mechanisms, committees, working groups or alliances that meet regularly and make decisions about restoration? Do these coordination efforts include shared plans, data, technical input, and monitoring, especially across local, regional and national levels of governance?'),
        followUpQuestions: parseFollowUpQuestions('If no, then what is missing in terms of coordination?'),
        strategyExamples: sanitizeText('Within government, create an interministerial Ecosystem Restoration Task Force charged with coordinating government (national, state, municipal) activities on restoration.\nCreate a multisector stakeholder restoration initiative that sets the vision and coordinates restoration activities across the landscape (e.g., the Brazilian Atlantic Forest PACT).'),
        sortOrder: 21,
      },
      // IMPLEMENT (22-31)
      {
        questionCode: 'I01',
        theme: Theme.IMPLEMENT,
        enablingCondition: 'Leadership',
        minimalKeySuccessFactor: 'Restoration champions',
        keySuccessFactor: 'National and/or local restoration champions exist',
        questionText: sanitizeQuestionText('Is there a charismatic, committed champion(s) of restoration for the target area? Do they represent all stakeholders in society, including women, youth, and Indigenous peoples?'),
        definition: sanitizeText('Charismatic people (or powerful institutions) exist who can effectively inspire decision makers to pursue restoration, mobilize support, and maintain momentum over time in the candidate landscape.'),
        considerations: sanitizeText('Champions can be individuals or groups who are committed to landscape restoration, and able to act upon these commitments. In some landscapes or ecosystems, champions may need to be cultivated and given a visible profile.\nHistorically, successful examples of restoration had either a champion or strong government support. Few lacked both.'),
        followUpQuestions: parseFollowUpQuestions('Who is the champion(s)?'),
        strategyExamples: sanitizeText('Cultivate, support, and give a voice to prospective restoration champions (individuals, organizations).\nConvene meetings of champions and prospective champions from multiple locations (even outside the candidate landscape) so they inspire each other and share best practices.'),
        sortOrder: 22,
      },
      {
        questionCode: 'I02',
        theme: Theme.IMPLEMENT,
        enablingCondition: 'Leadership',
        minimalKeySuccessFactor: 'Political commitments',
        keySuccessFactor: 'Sustained political commitment exists',
        questionText: sanitizeQuestionText('Is there clear and sustained long-term commitment from government and non-governmental institutions to support restoration efforts in the target landscape?'),
        definition: sanitizeText('Commitment from government authorities (across relevant levels, where applicable) and non-governmental institutions to restoration in the target area is clearly established and recognized as a sustained, long-term commitment.'),
        considerations: sanitizeText('It may be difficult to predict the long-term commitment of a government or organization. In such situations, consider whether the commitment transcends political parties and whether the restoration will produce recurring benefits for key stakeholders.'),
        followUpQuestions: parseFollowUpQuestions('If yes, what is the proof of the expressed commitment, and from whom?'),
        strategyExamples: sanitizeText('Create and mobilize a broad constituency (representing multiple sectors including agriculture) that keeps restoration on the national political agenda.'),
        sortOrder: 23,
      },
      {
        questionCode: 'I03',
        theme: Theme.IMPLEMENT,
        enablingCondition: 'Knowledge',
        minimalKeySuccessFactor: 'Restoration \'know how\' exists',
        keySuccessFactor: 'Restoration "know how" relevant to candidate landscapes exist',
        questionText: sanitizeQuestionText('Does diverse local knowledge exist (including Indigenous, traditional ecological knowledge, and gender-informed knowledge) on how to implement restoration at scale in the target landscape?'),
        definition: sanitizeText('Local experts know of -- or generate research on -- restoration techniques (e.g., natural and assisted regeneration, traditional knowledge) tailored to the candidate landscape.'),
        considerations: sanitizeText('Local expertise can come from traditional knowledge from communities living in or around the landscape, experts from universities and rural extension services, and nongovernmental organizations active in the field.\nThe know-how may be generated locally or might be imported from elsewhere but should be communicated or delivered by local practitioners. Best practice guidance on restoration may be available from universities, nongovernmental organizations, or extension agencies, as well as from local individuals or groups with long-term restoration expertise.'),
        followUpQuestions: parseFollowUpQuestions('If no, then what are the most important knowledge gaps?'),
        strategyExamples: sanitizeText('Create programs on ecosystem restoration in universities and agriculture schools.\nPrioritize ecosystem restoration in public and private research grant-making programs.\nBuild bridges between researchers and restoration practitioners so the former generate actionable research that is applied in the landscape.'),
        sortOrder: 24,
      },
      {
        questionCode: 'I04',
        theme: Theme.IMPLEMENT,
        enablingCondition: 'Knowledge',
        minimalKeySuccessFactor: 'Knowledge transfer',
        keySuccessFactor: 'Restoration "know how" is transferred via peers or extension services',
        questionText: sanitizeQuestionText('Are extension services, farmer-to-farmer visits, women\'s groups, local networks and/or other means of awareness raising and capacity building for restoration in place, and adequately resourced in the target landscape or at national level?'),
        definition: sanitizeText('Technical assistance and rural extension (extension services), farmer-to-farmer visits, women\'s groups, local networks and/or other means of awareness raising and capacity building for restoration are in place and adequately resourced in the candidate landscape.'),
        considerations: sanitizeText('Knowledge sharing may be documented in formal extension services like field visits, training programs, field schools, printed materials and demonstration sites.\nConsider whether informal learning groups on restoration are sharing information or coordinating activities, including women\'s groups, producer associations, or knowledge exchange among Indigenous Peoples. This Farmer-to-farmer or land-manager-to-land-manager communication can be one of the most effective means of education and training.\nLocal networks or partnerships for capacity building on ecosystem restoration, agroforestry, or reforestation may be reported in national documents or reports by nongovernmental organizations.'),
        followUpQuestions: parseFollowUpQuestions('For the candidate landscape, which entities are best positioned to deliver extension services?'),
        strategyExamples: sanitizeText('Facilitate farmer-to-farmer meetings and interaction regarding restoration.\nSet key performance indicators related to ecosystem restoration for extension agents.\nIncrease funding for ecosystem restoration training within extension services.\nInclude restoration technical assistance as part of agriculture financing packages to farmers.\nUtilize modern information and communication technologies to better connect extension agents and land managers, and to provide both with the most up-to-date research and information.'),
        sortOrder: 25,
      },
      {
        questionCode: 'I05',
        theme: Theme.IMPLEMENT,
        enablingCondition: 'Technical design',
        minimalKeySuccessFactor: 'Technical & climate resilient',
        keySuccessFactor: 'Restoration design is technically grounded and climate resilient',
        questionText: sanitizeQuestionText('Is the restoration plan for the target landscape based on best practices, incorporating the best available science, traditional ecological knowledge, and climate resilient approaches?'),
        definition: sanitizeText('The landscape restoration plan for the candidate landscape is based on best practices for design, implementation, and maintenance of restoration activities. The landscape restoration plan incorporates the best available science and climate resilient approaches that ensure the intervention, including aspects such as species selection and restoration techniques, is appropriate for the local context and goals of the intervention, and reduce vulnerability of the restoration intervention to climate impacts such as drought, flood, wildfires, and extreme temperatures.'),
        considerations: sanitizeText('Consider whether the approaches for ecosystem restoration are supported by scientific research, local knowledge, or Indigenous practices for recovering natural ecosystems and reducing vulnerability to climate impacts. Technical design should address aspects such as site preparation, slope, species selection, tree spacing, and maintenance, or how to remove pressures preventing natural vegetation from regrowing (e.g., livestock, fire).\nRestoration plans should factor in projected climate impacts in order to be climate resilient.'),
        followUpQuestions: parseFollowUpQuestions('If no, then what is missing from the plan?'),
        strategyExamples: sanitizeText('Develop an ecosystem restoration plan informed by the best science and factoring in climate change.\nReview restoration plans of successful restoration experiences elsewhere to gain insights on best practice.'),
        sortOrder: 26,
      },
      {
        questionCode: 'I06',
        theme: Theme.IMPLEMENT,
        enablingCondition: 'Technical design',
        minimalKeySuccessFactor: 'Limits \'leakage\'',
        keySuccessFactor: 'Restoration limits "leakage"',
        questionText: sanitizeQuestionText('Does the restoration process have provisions in place (e.g., policies, practices, incentives, yield improvements) that limit leakage or is unfolding in a manner that reduces leakage? Do restoration activities avoid displacement of land users to other areas where they have no option but to transform/clear natural ecosystems for agricultural land uses?'),
        definition: sanitizeText('Ecosystem restoration in the candidate landscape avoids transferring land clearing activities to other locations (leakage), resulting in net increase of restored area.'),
        considerations: sanitizeText('There is a risk that ecosystem restoration in the target landscape could result in displacing the activities that were causing land degradation to some other landscape.\nWhile such leakage might result in an increase in the amount of restored area in the target landscape, it would result in an increase of degraded or deforested lands elsewhere.\nWays to limit leakage of restoration activities could include: Combining restoration with productive uses (e.g., agroforestry), providing local livelihood alternatives that do not require converting lands into agriculture, increasing agricultural efficiency so output doesn\'t move to new areas, planning restoration at the landscape level to manage where activities shift and addressing underlying drivers of degradation.\nFor more information on reforestation in one country displacing deforestation to another country to another see: Meyfroidt and Lambin (2011).'),
        followUpQuestions: parseFollowUpQuestions('If no, then what measures are missing from the restoration process to avoid displacement of land degradation to other areas?'),
        strategyExamples: sanitizeText('Introduce measures that increase the productivity per hectare of crops, livestock, or timber from existing agricultural and forestry lands\nIntroduce measures that decrease demand for crops, livestock, or timber'),
        sortOrder: 27,
      },
      {
        questionCode: 'I07',
        theme: Theme.IMPLEMENT,
        enablingCondition: 'Finance and incentives',
        minimalKeySuccessFactor: 'Outweighs negative incentives',
        keySuccessFactor: 'Positive incentives and funds for restoration outweigh negative incentives',
        questionText: sanitizeQuestionText('From the perspective of relevant stakeholders, do available financial incentives and funding mechanisms sufficiently encourage restoration in the target landscape, relative to incentives that may discourage or impede ecosystem recovery?'),
        definition: sanitizeText('From the perspective of relevant stakeholders, financial incentives and funding mechanisms to support restoration in the candidate area are available, accessible, and sufficiently attractive to encourage investment in restoration activities. These incentives are designed to offset opportunity costs and financial risks associated with restoration, and to outweigh competing incentives that favor land uses or practices that hinder or delay ecosystem recovery. The overall incentive framework supports sustained engagement in restoration over the long term.'),
        considerations: sanitizeText('Restoration can occur when overall incentives outweigh both the costs of restoration and the ongoing benefits occurring on the degraded landscape.\nPositive incentives (e.g., grants, loans, tax breaks, subsidies, ecosystem service payments, private goods and services) encourage restoration, while negative incentives (e.g., subsidies for livestock, agriculture, or extractive industries) discourage restoration.\nIf the positive incentives are overshadowed by negative incentives, large-scale restoration is unlikely; and both the amount and timing of incentives matter.\nIncentives and finance are part of implementation because they directly affect land managers\' decisions to restore.'),
        followUpQuestions: parseFollowUpQuestions('What are the key positive and negative incentives influencing restoration and land-use decisions in the target landscape?\nFrom the perspective of relevant stakeholders, what is the magnitude or scale of these incentives (e.g., financial value per hectare or comparable measures)?'),
        strategyExamples: sanitizeText('Introduce ecosystem restoration-dedicated financing mechanisms, such as:\nGrants\nLow-interest loans\nTax breaks (on the inputs, outputs, or financing of restoration)\nDirect government expenditures\nGovernment procurement policies\nPayments for ecosystem services (e.g., water, carbon)\nRemove or reduce incentives that discourage forest or tree regrowth'),
        sortOrder: 28,
      },
      {
        questionCode: 'I08',
        theme: Theme.IMPLEMENT,
        enablingCondition: 'Finance and incentives',
        minimalKeySuccessFactor: 'Finance available',
        keySuccessFactor: 'Finance is available for restoration actions',
        questionText: sanitizeQuestionText('Are financial incentives and funding mechanisms designed to promote restoration in the target area accessible, inclusive, and usable by a diverse range of stakeholders, including local communities?'),
        definition: sanitizeText('Financial mechanisms and incentives have been thoughtfully designed, selected, and implemented to effectively support restoration policies, actions, and measures at both landscape and community scales. These mechanisms are accessible to a wide range of stakeholders, promote equitable participation, and leverage private sector finance where appropriate to enhance and sustain restoration outcomes.'),
        considerations: sanitizeText('Incentives and funds include grants, loans, tax breaks on the inputs, outputs, or financing of restoration, direct government expenditures like subsidies or procurement policies, payments for ecosystem services, or private markets for goods and services that encourage ecosystem restoration efforts.\nConsider whether individuals, communities, or groups in the restoration landscape(s) have applied to and received financial support for restoration activities. Include feedback from the individuals or groups who have tried to access these incentives or funds but were not successful.'),
        followUpQuestions: parseFollowUpQuestions('If no, then what are the barriers to access?'),
        strategyExamples: sanitizeText('Actively communicate and publicize the availability of financial incentives and funding opportunities through accessible and targeted outreach.\nProvide technical and administrative assistance to stakeholders and land users to support application, compliance, and reporting processes.\nSimplify application procedures and reduce administrative and documentation requirements to lower barriers to accessing incentives and funds.'),
        sortOrder: 29,
      },
      {
        questionCode: 'I09',
        theme: Theme.IMPLEMENT,
        enablingCondition: 'Feedback',
        minimalKeySuccessFactor: 'Monitoring & evaluation',
        keySuccessFactor: 'Effective monitoring and evaluation system is in place',
        questionText: sanitizeQuestionText('Is there a monitoring system in place for tracking and evaluating restoration progress at the relevant landscape or national level, and does it align with the national and global monitoring systems?'),
        definition: sanitizeText('A system for monitoring progress and evaluating impact of restoration in the candidate landscape exists.'),
        considerations: sanitizeText('Information for monitoring and evaluation should be gathered in a planned, ongoing way to provide insight and feedback on the implementation of restoration activities. Aspects to monitor may include hectares under restoration, survival rates of planted species, quantified economic and social benefits, and ecosystem service flows.\nMonitoring and evaluation systems may employ approaches such as remote sensing, crowd-sourced ground-level monitoring (e.g., using community, volunteers, and communication technologies), and surveys of inhabitants of the target landscape.'),
        followUpQuestions: parseFollowUpQuestions('If yes, is baseline data already being gathered?\nIf no, what aspects of a performance monitoring system are missing?'),
        strategyExamples: sanitizeText('Whenever possible, establish a baseline (e.g., photos, satellite imagery, data on hectares and other measurements from the landscape as it is) to enable comparisons over time.\nDevelop and implement a performance monitoring system (including remote sensing monitoring and ground-level participatory monitoring).'),
        sortOrder: 30,
      },
      {
        questionCode: 'I10',
        theme: Theme.IMPLEMENT,
        enablingCondition: 'Feedback',
        minimalKeySuccessFactor: 'Communicating early wins',
        keySuccessFactor: 'Early and ongoing successes are communicated',
        questionText: sanitizeQuestionText('Are restoration successes being communicated in the target landscape and the target audience being identified?'),
        definition: sanitizeText('Key successes in restoring the candidate landscape are promptly shared with stakeholders, ensuring they are informed of the progress and fostering a sense of partnership and engagement.'),
        considerations: sanitizeText('Communication may take the form of documentation and story coverage in media campaigns and social media, but may also include direct observation via visits of farmers, land managers, and decision makers to restoration sites.\nAchieving and publicly communicating success, including early wins can help maintain momentum, recruit more engagement, trigger replication elsewhere in the landscape, shore up political support, and sustain external financing.'),
        followUpQuestions: parseFollowUpQuestions('If yes, how are the successes communicated (e.g., through what media)?\nIf no, what media are available that could be utilized?'),
        strategyExamples: sanitizeText('Publicly communicate restoration progress, success stories, and lessons learned. Ensure the stories connect with the target audiences (e.g., images of progress, stories of benefits to people).'),
        sortOrder: 31,
      },
    ]

    console.log(`📝 Processing ${questionsData.length} questions...`)

    // Upsert each question
    for (const questionData of questionsData) {
      const existing = await questionRepo.findOne({
        where: {
          diagnosticId: diagnostic.id,
          questionCode: questionData.questionCode,
        },
      })

      if (existing) {
        console.log(`  ↻ Updating question ${questionData.questionCode}: ${questionData.keySuccessFactor}`)
        await questionRepo.update(existing.id, {
          ...questionData,
          diagnosticId: diagnostic.id,
        })
      } else {
        console.log(`  + Creating question ${questionData.questionCode}: ${questionData.keySuccessFactor}`)
        const newQuestion = questionRepo.create({
          ...questionData,
          diagnosticId: diagnostic.id,
        })
        await questionRepo.save(newQuestion)
      }
    }

    await queryRunner.commitTransaction()

    console.log('✅ Diagnostic questions seed completed successfully!')
    console.log(`   - Diagnostic: ${diagnostic.title} (${diagnostic.version})`)
    console.log(`   - Questions: ${questionsData.length} total`)
    console.log(`   - Motivate: 8 questions (M01-M08)`)
    console.log(`   - Enable: 13 questions (E01-E13)`)
    console.log(`   - Implement: 10 questions (I01-I10)`)
  } catch (error) {
    await queryRunner.rollbackTransaction()
    console.error('❌ Error seeding diagnostic questions:', error)
    throw error
  } finally {
    await queryRunner.release()
  }
}


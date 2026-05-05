window.IELTS = window.IELTS || {};
window.IELTS.writingQuestions = {
  task1: [
    {
      id: "t1_1",
      type: "Line Graph",
      title: "Internet Users Growth",
      prompt: "The graph below shows the percentage of households with internet access in four countries between 2000 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
      imageDesc: "[Line graph: Four countries (USA, UK, China, India) showing internet penetration from 0-90% over 20 years. USA and UK high and plateauing; China rapid growth; India steady but lower growth]",
      keyFeatures: ["Overall upward trend for all countries", "USA/UK reach near-saturation (80-90%)", "China shows the steepest growth rate", "India remains lowest but shows steady growth", "Comparison of rates of change"],
      modelOpener: "The line graph illustrates internet access rates across four nations over a 20-year period from 2000 to 2020. Overall, all countries experienced significant growth, though at markedly different rates.",
      bandDescriptors: {TR: "Cover all 4 countries, main trends, comparisons", CC: "Clear overview, logical progression, good paragraphing", LR: "Data language: rose sharply, plateaued, remained relatively low", GRA: "Mix of tenses, complex sentences with subordinate clauses"}
    },
    {
      id: "t1_2",
      type: "Bar Chart",
      title: "Transportation Methods",
      prompt: "The bar chart below shows the percentage of people using different types of transport to get to work in three cities in 2023.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
      imageDesc: "[Bar chart: Three cities (London, Sydney, Tokyo) with bars for car, public transport, cycling, walking. Tokyo highest public transport; Sydney highest car use; London balanced]",
      keyFeatures: ["Tokyo has highest public transport use (75%)", "Sydney most car-dependent (65%)", "London shows most balanced distribution", "Cycling highest in London (15%)", "Walking lowest across all cities"],
      modelOpener: "The bar chart compares the transport methods used by commuters in London, Sydney, and Tokyo in 2023. It is immediately apparent that Tokyo residents rely most heavily on public transport, while Sydney shows the highest car dependency.",
      bandDescriptors: {TR: "Compare all transport types across all cities", CC: "Clear overview statement, group comparisons logically", LR: "Comparative language: higher than, in contrast to, whereas", GRA: "Comparative structures: more...than, the highest/lowest"}
    },
    {
      id: "t1_3",
      type: "Pie Charts",
      title: "Energy Sources",
      prompt: "The pie charts below show the sources of electricity generation in Country A in 1990 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
      imageDesc: "[Two pie charts: 1990 (Coal 60%, Oil 20%, Gas 15%, Renewables 5%) vs 2020 (Coal 20%, Oil 10%, Gas 25%, Renewables 30%, Nuclear 15%)]",
      keyFeatures: ["Dramatic reduction in coal use (60% to 20%)", "Huge growth in renewables (5% to 30%)", "Nuclear energy introduced", "Natural gas became more important", "Overall shift from fossil fuels to cleaner energy"],
      modelOpener: "The two pie charts illustrate how electricity generation sources in Country A changed between 1990 and 2020. The most striking change is the dramatic decline in coal use and the corresponding rise of renewable energy.",
      bandDescriptors: {TR: "All energy types discussed, clear comparison between years", CC: "Clearly structured overview, logical grouping of changes", LR: "Change language: declined significantly, accounted for, overtook", GRA: "Past tenses, passive voice for change descriptions"}
    },
    {
      id: "t1_4",
      type: "Table",
      title: "Population Statistics",
      prompt: "The table below shows information about population, life expectancy, and GDP per capita in five countries in 2022.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
      imageDesc: "[Table with rows: Australia, UK, Japan, Brazil, Nigeria. Columns: Population (millions), Life expectancy, GDP per capita (USD), Urban population %]",
      keyFeatures: ["Japan has highest life expectancy (84)", "Nigeria has lowest GDP but highest population growth", "Australia has highest GDP per capita", "Japan and Australia have highest urban %", "Brazil has mid-range in most categories"],
      modelOpener: "The table provides comparative data on four key indicators for five countries in 2022. While Japan and Australia lead in life expectancy and urbanisation, there are notable differences in economic output and population size across the nations presented.",
      bandDescriptors: {TR: "Select and compare key data points, not just list all numbers", CC: "Group similar countries or similar trends together", LR: "Noun phrases: the highest rate, a significantly lower figure", GRA: "Relative clauses, nominal phrases"}
    },
    {
      id: "t1_5",
      type: "Process Diagram",
      title: "Recycling Process",
      prompt: "The diagram below shows how paper is recycled.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
      imageDesc: "[Flow diagram: Used paper collected → Sorted → Transported to recycling plant → Shredded → Mixed with water/chemicals → Pulped → Cleaned → Dried → New paper rolls → Distributed to publishers/consumers]",
      keyFeatures: ["Linear process with 9 clear stages", "Collection and sorting happen first", "Water is essential in the pulping stage", "Chemical treatment removes ink", "Final product is ready for commercial use"],
      modelOpener: "The diagram illustrates the process by which used paper is recycled into new paper products. The process consists of nine distinct stages, beginning with collection from households and businesses and ending with distribution of the finished product.",
      bandDescriptors: {TR: "All stages covered in correct sequence", CC: "Sequence language: first, then, subsequently, finally", LR: "Passive voice, process vocabulary", GRA: "Passive constructions: is collected, is transported, are added"}
    },
    {
      id: "t1_6",
      type: "Map",
      title: "Town Development",
      prompt: "The maps below show a town in 2000 and how it looks today after recent development.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
      imageDesc: "[Two maps: 2000 (farmland north, small town centre, one road) vs Now (residential area north, expanded centre with shopping mall and hospital, ring road, new park in south)]",
      keyFeatures: ["Farmland replaced by residential area", "New shopping mall constructed", "Hospital built in north", "Ring road added", "Park added in south", "Town centre expanded significantly"],
      modelOpener: "The two maps compare the town's layout in 2000 with its current appearance following recent development. It is clear that the town has expanded considerably, with major changes to the north and the addition of several new amenities.",
      bandDescriptors: {TR: "Key changes identified, not minor details", CC: "Spatial language: to the north, adjacent to, replaced by", LR: "Change verbs: constructed, demolished, expanded, converted", GRA: "Past and present tenses for comparison, passive voice"}
    },
    {
      id: "t1_7",
      type: "Mixed Charts",
      title: "Tourism Statistics",
      prompt: "The chart and graph below show information about international tourism. The bar chart shows the top tourist destinations in 2022, and the line graph shows visitor numbers from 2010 to 2022.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
      imageDesc: "[Bar chart: France, Spain, USA, China, Italy (visitor millions). Line graph: Global tourism 2010-2022 with dip in 2020-2021]",
      keyFeatures: ["France is most visited country", "Global tourism grew until 2019", "Sharp decline in 2020 due to pandemic", "Recovery began in 2021-2022", "European countries dominate top destinations"],
      modelOpener: "The charts present data on international tourism, comparing the most popular destinations in 2022 and tracking global visitor trends over a 12-year period. A notable feature is the dramatic fall in tourist numbers in 2020.",
      bandDescriptors: {TR: "Cover both charts, link them if possible", CC: "Clear overview, reference both data sources", LR: "Contrast language for the 2020 drop", GRA: "Complex sentences linking cause and effect"}
    },
    {
      id: "t1_8",
      type: "Line Graph",
      title: "Employment Trends",
      prompt: "The graph below shows changes in employment rates in the manufacturing, services, and agriculture sectors in a developing country between 1980 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
      imageDesc: "[Line graph: Agriculture declining from 60% to 20%; Services rising from 15% to 55%; Manufacturing steady around 25%]",
      keyFeatures: ["Agriculture dominant in 1980 but declined sharply", "Services grew most significantly", "Manufacturing remained relatively stable", "Agriculture and services crossed around 2000", "Overall economic modernisation trend"],
      modelOpener: "The graph tracks employment patterns across three economic sectors in a developing nation from 1980 to 2020. The most striking feature is the reversal of dominance between agriculture and the services sector over this 40-year period.",
      bandDescriptors: {TR: "All three sectors discussed, key crossover point noted", CC: "Overview, then detailed comparison", LR: "Sector-specific vocabulary, trend language", GRA: "Subordinate clauses: while, whereas, although"}
    },
    {
      id: "t1_9",
      type: "Bar Chart",
      title: "Household Spending",
      prompt: "The chart below shows the proportion of household income spent on different categories in Australia in 2022.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
      imageDesc: "[Horizontal bar chart: Housing (35%), Food (18%), Transport (12%), Healthcare (8%), Education (6%), Entertainment (5%), Clothing (4%), Other (12%)]",
      keyFeatures: ["Housing is by far the largest expenditure", "Food and transport are second and third", "Discretionary spending (entertainment, clothing) relatively small", "Healthcare significant at 8%", "Housing dominates Australian household budgets"],
      modelOpener: "The bar chart illustrates how Australian households allocated their income across eight spending categories in 2022. Housing expenditure clearly dominates, representing over a third of household budgets.",
      bandDescriptors: {TR: "Most significant categories highlighted, proportions compared", CC: "Group into essentials vs discretionary spending", LR: "Proportion language: accounts for, the largest share", GRA: "Passive and active structures, comparatives"}
    },
    {
      id: "t1_10",
      type: "Pie Chart & Table",
      title: "Education Statistics",
      prompt: "The pie chart shows the highest level of education achieved by adults in a country, and the table shows the average income for each education level.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
      imageDesc: "[Pie chart: No qualifications 15%, Secondary 40%, Vocational 20%, Undergraduate 18%, Postgraduate 7%. Table: Each level's average annual salary]",
      keyFeatures: ["Secondary education most common", "Positive correlation between education and income", "Postgraduates earn significantly more", "Large group with no qualifications (15%)", "Vocational training undervalued compared to degrees"],
      modelOpener: "The data presents two related perspectives on education: the distribution of qualifications across the adult population and the income associated with each level. A clear relationship emerges between educational attainment and earning potential.",
      bandDescriptors: {TR: "Link the two data sources together clearly", CC: "Make the connection between charts explicit", LR: "Correlation language: linked to, associated with, corresponds to", GRA: "Relative clauses, complex comparisons"}
    }
  ],

  task2: [
    {
      id: "t2_1",
      type: "Opinion",
      title: "Technology & Human Connection",
      prompt: "Some people believe that modern technology is making people less sociable and more isolated. Others argue that technology actually brings people closer together.\n\nDiscuss both views and give your own opinion.\n\nWrite at least 250 words.",
      keyArguments: {
        for: ["Social media connects distant friends and family", "Online communities bring like-minded people together", "Video calls allow real-time connection globally"],
        against: ["Face-to-face interaction declining", "Phone addiction at social gatherings", "Superficial online relationships replacing deep ones", "Digital divide isolating elderly"],
        conclusion: "Technology is a tool; its social effects depend on how it is used. Regulation and digital literacy are key."
      },
      bandTips: "Present both sides fairly before your opinion. Use academic hedging: 'it could be argued that...'. End with a clear personal stance."
    },
    {
      id: "t2_2",
      type: "Problem & Solution",
      title: "Traffic Congestion",
      prompt: "Traffic congestion in cities is a major problem causing pollution, wasted time, and economic losses.\n\nWhat are the causes of this problem? What measures could be taken to solve it?\n\nWrite at least 250 words.",
      keyArguments: {
        causes: ["Car dependency and poor public transport", "Urban sprawl", "Inadequate road infrastructure", "Lack of cycling infrastructure"],
        solutions: ["Investment in public transport", "Congestion charging (London example)", "Remote working policies", "Cycling infrastructure", "Better city planning"],
        conclusion: "A multi-faceted approach combining infrastructure, policy, and behavioural change is needed."
      },
      bandTips: "Clearly separate causes and solutions. Use specific examples from real cities (London, Singapore, Amsterdam)."
    },
    {
      id: "t2_3",
      type: "Agree or Disagree",
      title: "University Education",
      prompt: "Universities should focus on providing practical skills and knowledge that prepare students for the job market, rather than on academic theory.\n\nTo what extent do you agree or disagree?\n\nWrite at least 250 words.",
      keyArguments: {
        agree: ["Employers value practical experience", "Graduate unemployment is high", "Expensive tuition should lead to employment", "Vocational skills are in demand"],
        disagree: ["Critical thinking transcends specific jobs", "Academic research drives innovation", "Education has intrinsic value beyond employment", "Practical skills become outdated; adaptability does not"],
        conclusion: "Balance is ideal. Universities should develop both critical thinking and practical competencies."
      },
      bandTips: "Take a clear position. Partially agree is fine. Use 'while/although' to acknowledge the other side before your argument."
    },
    {
      id: "t2_4",
      type: "Discussion",
      title: "Raising Children",
      prompt: "Some parents believe children should be allowed to make their own decisions and learn from their mistakes. Others think parents should guide and control their children's choices.\n\nDiscuss both views and give your own opinion.\n\nWrite at least 250 words.",
      keyArguments: {
        view1: ["Independence builds resilience", "Mistakes are the best teachers", "Overly controlled children struggle as adults", "Autonomy supports mental health"],
        view2: ["Children lack judgment and experience", "Some mistakes have serious consequences", "Parental guidance provides moral compass", "Cultural and safety considerations"],
        conclusion: "Age-appropriate autonomy within a framework of guidance is the most effective approach."
      },
      bandTips: "Show empathy for both parenting styles. Use hedging for your opinion ('I would argue that...'). Give examples."
    },
    {
      id: "t2_5",
      type: "Problem & Solution",
      title: "Youth Mental Health",
      prompt: "Mental health problems among young people are increasing in many countries.\n\nWhat are the causes of this? What can be done to improve young people's mental health?\n\nWrite at least 250 words.",
      keyArguments: {
        causes: ["Social media pressure and comparison", "Academic pressure", "Economic uncertainty", "Family breakdown", "Reduced outdoor activity and exercise"],
        solutions: ["School counselling services", "Mental health education", "Social media regulation", "Parental support programmes", "Reducing academic pressure"],
        conclusion: "Society must prioritise mental health with the same urgency as physical health."
      },
      bandTips: "Show awareness that causes are interconnected. Use specialist vocabulary: anxiety, depression, resilience, wellbeing."
    },
    {
      id: "t2_6",
      type: "Agree or Disagree",
      title: "Globalisation & Culture",
      prompt: "Globalisation means that the world is becoming increasingly similar. This threatens the existence of individual cultures.\n\nTo what extent do you agree or disagree?\n\nWrite at least 250 words.",
      keyArguments: {
        agree: ["Western brands and media dominate globally", "Local languages are dying out", "Traditional practices being replaced", "Cultural homogenisation"],
        disagree: ["Cultural exchange enriches diversity", "Cultures can coexist and adapt", "Local cultures are resilient", "Globalisation can increase interest in local culture"],
        conclusion: "While globalisation poses risks, cultures have always evolved. Active preservation efforts are the answer."
      },
      bandTips: "Use sophisticated vocabulary: homogenisation, cultural imperialism, heritage, coexist. Show balanced thinking."
    },
    {
      id: "t2_7",
      type: "Discussion",
      title: "Space Exploration",
      prompt: "Some people think the money spent on space exploration could be better spent solving problems on Earth such as poverty and disease. Others believe space exploration is essential for the future of humanity.\n\nDiscuss both views and give your own opinion.\n\nWrite at least 250 words.",
      keyArguments: {
        view1: ["Billions needed to fight poverty and disease", "Immediate human suffering takes priority", "Resources should address proven problems first"],
        view2: ["Space technology has practical benefits (GPS, satellites)", "Addresses long-term existential risks", "Scientific knowledge has unpredictable value", "Inspires future generations of scientists"],
        conclusion: "Both are priorities. Space exploration should not come at the expense of basic human needs."
      },
      bandTips: "Show you understand the long-term perspective. Use phrases expressing value: 'the potential benefits outweigh...'"
    },
    {
      id: "t2_8",
      type: "Agree or Disagree",
      title: "Elderly Care",
      prompt: "In many countries, elderly people are increasingly cared for in retirement homes rather than by their families.\n\nIs this a positive or negative development?\n\nWrite at least 250 words.",
      keyArguments: {
        positive: ["Professional medical care", "Social interaction with peers", "Reduces burden on working families", "Specialised facilities"],
        negative: ["Loss of family bonds", "Cultural duty of filial care", "Quality of care concerns", "Loneliness and isolation", "Loss of dignity"],
        conclusion: "A hybrid approach combining family involvement with professional support is ideal."
      },
      bandTips: "Show cultural sensitivity. Use phrases: 'it is worth noting that...', 'the extent to which this is true varies by...'"
    },
    {
      id: "t2_9",
      type: "Problem & Solution",
      title: "Environmental Degradation",
      prompt: "Many of the world's natural habitats and species are under threat from human activity.\n\nWhat are the main causes of this? What actions could governments and individuals take to protect the natural environment?\n\nWrite at least 250 words.",
      keyArguments: {
        causes: ["Deforestation for agriculture", "Industrial pollution", "Urbanisation destroying habitats", "Overuse of pesticides", "Climate change"],
        solutions: {government: ["Protected areas legislation", "Carbon taxes", "International treaties", "Funding for renewable energy"], individual: ["Reduced meat consumption", "Sustainable consumer choices", "Support environmental organisations"]},
        conclusion: "Protection requires both systemic change and individual responsibility."
      },
      bandTips: "Distinguish between government and individual actions. Use conditional: 'if governments were to...' Use environment vocabulary."
    },
    {
      id: "t2_10",
      type: "Discussion",
      title: "Migration for Work",
      prompt: "More and more people are moving abroad to find work. Some people argue this has many benefits both for the individual and for the countries they move to and from.\n\nTo what extent do you agree that migration for work is beneficial?\n\nWrite at least 250 words.",
      keyArguments: {
        benefits: ["Higher wages and opportunities for migrants", "Fills labour shortages in destination country", "Remittances support families in origin country", "Cultural exchange"],
        drawbacks: ["Brain drain from developing countries", "Social challenges for migrants", "Pressure on public services", "Cultural integration difficulties"],
        conclusion: "Overall beneficial, but policies needed to manage the challenges and ensure migrants' rights."
      },
      bandTips: "This is highly relevant to your Australia migration goals. Draw on this experience authentically. Use phrases like 'skilled migration programs such as Australia's points-based system demonstrate...'"
    }
  ]
};

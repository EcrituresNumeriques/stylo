const { previewEntries } = require('./bibliography.js')

describe('previewEntries', () => {
  test('returns nothing if empty', () => {
    expect(previewEntries('    \n')).toEqual('')
    expect(previewEntries(null)).toEqual('')
  })

  test('ignore invalid parts', () => {
    const bib = `An error occurred
    @misc{dehut_en_2018,
      type = {Billet},
      title = {En finir avec {Word} ! {Pour} une analyse des enjeux relatifs aux traitements de texte et à leur utilisation}
    }`

    const expected = `    @misc{dehut_en_2018,
      type = {Billet},
      title = {En finir avec {Word} ! {Pour} une analyse des enjeux relatifs aux traitements de texte et à leur utilisation}
    }`

    expect(previewEntries(bib)).toEqual(expected)
  })

  test('returns 2 different kinds when available', () => {
    const bib = `@article{noauthor_dibutade_nodate,
      title = {Dibutade},
      volume = {10},
      url = {https://archives.musemedusa.com/dossier_6/},
      abstract = {ISSN 2369-3045 Dibutade L’origine de la création Dibutade, à sa façon Sébastien SauvéUniversité de Montréal Sébastien Sauvé poursuit une carrière académique universitaire de professeur en chimie environnementale et il est présentement vice-doyen à la recherche et à la création...},
      language = {en-US},
      urldate = {2022-11-01},
      journal = {MuseMedusa},
    }

    @article{monjour_authentique_2019,
      title = {Authentique artifice},
      copyright = {Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)},
      issn = {2104-3272},
      url = {http://sens-public.org/dossiers/1406/},
      abstract = {Née dans le sillage de la « grande conversion numérique », la réflexion intermédiale traite de phénomènes qui remontent bien au-delà des années 1980. Mais si la réflexion intermédiale est relativement récente, les dynamiques intermédiales qu’elle met au jour sont, quant à elles, plus que millénaires. L’apport majeur de la réflexion intermédiale est donc d’ouvrir des perspectives radicalement nouvelles sur des problématiques qui occupent, parfois depuis très longtemps, la pensée occidentale. C’est à un aspect de ces dynamiques que nous consacrons le présent dossier en nous interrogeant sur les notions clés de reproduction et de présence dans ces conjonctures médiatrices singulières que sont les pratiques représentationnelles. Nous le faisons en tentant de sortir des cadres réflexifs habituels. D’où ce titre : « Authentique artifice ».},
      language = {fr},
      urldate = {2022-11-01},
      journal = {Sens public},
      author = {Monjour, Servanne and Larrue, Jean-Marc and Vitali-Rosati, Marcello},
      month = may,
      year = {2019},
      note = {Publisher: Département des littératures de langue française},
    }

    @misc{monjour_dibutade_2015,
      type = {Text},
      title = {Dibutade 2.0 : la « femme-auteur » à l'ère du numérique},
      copyright = {Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0) Sens-Public, 2015},
      shorttitle = {Dibutade 2.0},
      url = {http://sens-public.org/articles/1164/},
      abstract = {Prenant le parti d’étudier la culture numérique émergente selon des rapports de continuité plutôt que de rupture, cet article envisage la question de l’auctorialité féminine sur le web au regard du mythe antique de Dibutade. Il semble en effet que Dibutade, en sa qualité de figure fondatrice de nombreuses pratiques …},
      language = {fr},
      urldate = {2021-10-28},
      journal = {Sens public},
      author = {Monjour, Servanne},
      month = sep,
      year = {2015},
      note = {ISSN: 2104-3272
      Publisher: Département des littératures de langue française},
    }

    @article{wormser_facebook_2017,
      title = {Facebook et la crise des élites},
      copyright = {http://creativecommons.org/licenses/by-nc-sa/4.0/},
      issn = {2104-3272},
      url = {http://www.sens-public.org/article1261.html},
      abstract = {Résumé : Tocqueville avait raison: les États-Unis donneraient le pouvoir à l'opinion. Facebook connecte chacun à ses proches, mais les réseaux sociaux renforcent le cloisonnement de la société. Si (...)},
      language = {fr},
      urldate = {2019-11-11},
      journal = {Sens Public},
      author = {Wormser, Gérard},
      month = oct,
      year = {2017},
    }

    @book{vallancien_homo_2017,
      address = {Paris},
      title = {Homo artificialis: plaidoyer pour un humanisme numérique},
      isbn = {978-2-84186-851-3},
      shorttitle = {Homo artificialis},
      publisher = {Michalon éditeur},
      author = {Vallancien, Guy},
      year = {2017},
      keywords = {Artificial intelligence, Biotechnology, Medical applications, Medical ethics, Moral and ethical aspects, Surgical robots},
    }`

    const expectation = `@article{noauthor_dibutade_nodate,
      title = {Dibutade},
      volume = {10},
      url = {https://archives.musemedusa.com/dossier_6/},
      abstract = {ISSN 2369-3045 Dibutade L’origine de la création Dibutade, à sa façon Sébastien SauvéUniversité de Montréal Sébastien Sauvé poursuit une carrière académique universitaire de professeur en chimie environnementale et il est présentement vice-doyen à la recherche et à la création...},
      language = {en-US},
      urldate = {2022-11-01},
      journal = {MuseMedusa},
    }

    @book{vallancien_homo_2017,
      address = {Paris},
      title = {Homo artificialis: plaidoyer pour un humanisme numérique},
      isbn = {978-2-84186-851-3},
      shorttitle = {Homo artificialis},
      publisher = {Michalon éditeur},
      author = {Vallancien, Guy},
      year = {2017},
      keywords = {Artificial intelligence, Biotechnology, Medical applications, Medical ethics, Moral and ethical aspects, Surgical robots},
    }`

    expect(previewEntries(bib)).toEqual(expectation)
  })

  test('returns 1 kinds if no choice', () => {
    const bib = `@article{noauthor_dibutade_nodate,
      title = {Dibutade},
      volume = {10},
      url = {https://archives.musemedusa.com/dossier_6/},
      abstract = {ISSN 2369-3045 Dibutade L’origine de la création Dibutade, à sa façon Sébastien SauvéUniversité de Montréal Sébastien Sauvé poursuit une carrière académique universitaire de professeur en chimie environnementale et il est présentement vice-doyen à la recherche et à la création...},
      language = {en-US},
      urldate = {2022-11-01},
      journal = {MuseMedusa},
    }

    @article{monjour_authentique_2019,
      title = {Authentique artifice},
      copyright = {Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)},
      issn = {2104-3272},
      url = {http://sens-public.org/dossiers/1406/},
      abstract = {Née dans le sillage de la « grande conversion numérique », la réflexion intermédiale traite de phénomènes qui remontent bien au-delà des années 1980. Mais si la réflexion intermédiale est relativement récente, les dynamiques intermédiales qu’elle met au jour sont, quant à elles, plus que millénaires. L’apport majeur de la réflexion intermédiale est donc d’ouvrir des perspectives radicalement nouvelles sur des problématiques qui occupent, parfois depuis très longtemps, la pensée occidentale. C’est à un aspect de ces dynamiques que nous consacrons le présent dossier en nous interrogeant sur les notions clés de reproduction et de présence dans ces conjonctures médiatrices singulières que sont les pratiques représentationnelles. Nous le faisons en tentant de sortir des cadres réflexifs habituels. D’où ce titre : « Authentique artifice ».},
      language = {fr},
      urldate = {2022-11-01},
      journal = {Sens public},
      author = {Monjour, Servanne and Larrue, Jean-Marc and Vitali-Rosati, Marcello},
      month = may,
      year = {2019},
      note = {Publisher: Département des littératures de langue française},
    }`

    const expectation = `@article{noauthor_dibutade_nodate,
      title = {Dibutade},
      volume = {10},
      url = {https://archives.musemedusa.com/dossier_6/},
      abstract = {ISSN 2369-3045 Dibutade L’origine de la création Dibutade, à sa façon Sébastien SauvéUniversité de Montréal Sébastien Sauvé poursuit une carrière académique universitaire de professeur en chimie environnementale et il est présentement vice-doyen à la recherche et à la création...},
      language = {en-US},
      urldate = {2022-11-01},
      journal = {MuseMedusa},
    }`

    expect(previewEntries(bib)).toEqual(expectation)
  })

  test('limit to {count} entries', () => {
    const bib = `@article{noauthor_dibutade_nodate,
      title = {Dibutade},
      volume = {10},
      url = {https://archives.musemedusa.com/dossier_6/},
      abstract = {ISSN 2369-3045 Dibutade L’origine de la création Dibutade, à sa façon Sébastien SauvéUniversité de Montréal Sébastien Sauvé poursuit une carrière académique universitaire de professeur en chimie environnementale et il est présentement vice-doyen à la recherche et à la création...},
      language = {en-US},
      urldate = {2022-11-01},
      journal = {MuseMedusa},
    }

    @article{monjour_authentique_2019,
      title = {Authentique artifice},
      copyright = {Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)},
      issn = {2104-3272},
      url = {http://sens-public.org/dossiers/1406/},
      abstract = {Née dans le sillage de la « grande conversion numérique », la réflexion intermédiale traite de phénomènes qui remontent bien au-delà des années 1980. Mais si la réflexion intermédiale est relativement récente, les dynamiques intermédiales qu’elle met au jour sont, quant à elles, plus que millénaires. L’apport majeur de la réflexion intermédiale est donc d’ouvrir des perspectives radicalement nouvelles sur des problématiques qui occupent, parfois depuis très longtemps, la pensée occidentale. C’est à un aspect de ces dynamiques que nous consacrons le présent dossier en nous interrogeant sur les notions clés de reproduction et de présence dans ces conjonctures médiatrices singulières que sont les pratiques représentationnelles. Nous le faisons en tentant de sortir des cadres réflexifs habituels. D’où ce titre : « Authentique artifice ».},
      language = {fr},
      urldate = {2022-11-01},
      journal = {Sens public},
      author = {Monjour, Servanne and Larrue, Jean-Marc and Vitali-Rosati, Marcello},
      month = may,
      year = {2019},
      note = {Publisher: Département des littératures de langue française},
    }`
    const expectation = `@article{noauthor_dibutade_nodate,
      title = {Dibutade},
      volume = {10},
      url = {https://archives.musemedusa.com/dossier_6/},
      abstract = {ISSN 2369-3045 Dibutade L’origine de la création Dibutade, à sa façon Sébastien SauvéUniversité de Montréal Sébastien Sauvé poursuit une carrière académique universitaire de professeur en chimie environnementale et il est présentement vice-doyen à la recherche et à la création...},
      language = {en-US},
      urldate = {2022-11-01},
      journal = {MuseMedusa},
    }`

    expect(previewEntries(bib, 1)).toEqual(expectation)
  })
})

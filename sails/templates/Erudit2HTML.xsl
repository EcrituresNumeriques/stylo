<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns:xlink="http://www.w3.org/1999/xlink"
    version="2.0"
    xpath-default-namespace="http://www.erudit.org/xsd/article"
       xmlns="http://www.w3.org/1999/xhtml"
    >
    <xsl:output
        method="xml"
        omit-xml-declaration = "yes"
        doctype-system="about:legacy-compat"
        encoding="UTF-8"
        indent="yes" />
    
    <xsl:template match="/">
        
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:dc="http://purl.org/dc/terms/"
            xmlns:foaf="http://xmlns.com/foaf/0.1/" xml:lang="fr">
    
            <head>
                
                <link rel="schema.DC" href="http://purl.org/dc/elements/1.1/" />
                <link rel="schema.MARCREL" href="http://www.loc.gov/loc.terms/relators/" />
                <link rel="DCTERMS.subject" href="http://rameau.bnf.fr" />
                <link rel="schema.prism" href="http://prismstandard.org/namespaces/basic/2.0/" />
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
                
                <!--Métadonnées Dublin Core -->          
                <meta name="DC.type" content="Text" />
                <meta name="DC.format" content="text/html" />
                <meta name="DC.type" content="journalArticle" />
                <meta name="DC.type" class="typeArticle">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/liminaire/grtitre/surtitre2)"/>
                    </xsl:attribute>
                </meta>
                <meta name="DC.title">
                <xsl:attribute name="content">
                    <xsl:value-of select="normalize-space(article/liminaire/grtitre/titre)"/>
                </xsl:attribute>
                </meta>
                <meta name="DC.title.Main">
                <xsl:attribute name="content">
                    <xsl:value-of select="normalize-space(article/liminaire/grtitre/titre)"/>
                </xsl:attribute>
                </meta>
                <xsl:if test="article/liminaire/grtitre/sstitre">
                <meta name="DC.title.Subtitle">
                <xsl:attribute name="content">
                    <xsl:value-of select="normalize-space(article/liminaire/grtitre/sstitre)"/>
                </xsl:attribute>
                </meta>
                </xsl:if>
                <meta name="DC.publisher" class="editeur">
                <xsl:attribute name="content">
                    <xsl:value-of select="normalize-space(article/admin/editeur/nomorg)"/>
                </xsl:attribute>
                </meta>
                <meta name="DC.publisher" class="producteur">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/admin/prod/nomorg)"/>
                    </xsl:attribute>
                </meta>
                <meta name="DC.publisher" class="producteurNum">
                        <xsl:attribute name="content">
                            <xsl:value-of select="normalize-space(article/admin/prodnum/nomorg)"/>
                        </xsl:attribute>
                </meta>
                <meta name="DC.publisher" class="diffuseur">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/admin/diffnum/nomorg)"/>
                    </xsl:attribute>
                </meta>
                <meta name="DC.language">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/@lang)"/>
                    </xsl:attribute>
                </meta>
                <meta name="DC.date" class="completeDate">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/admin/numero/pubnum/date)"/>
                    </xsl:attribute>
                </meta>
                <meta name="DC.date" class="year">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/admin/numero/pub/annee)"/>
                    </xsl:attribute>
                </meta>
                <meta name="DC.rights">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/admin/droitsauteur)"/>
                    </xsl:attribute>
                </meta>
                <meta name="DC.source">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/admin/revue/titrerev)"/>
                    </xsl:attribute>
                </meta>
                <meta name="DC.identifier" class="issn">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/admin/revue/idissnnum)"/>
                    </xsl:attribute>
                </meta>
                <xsl:if test="article/admin/numero/grtheme">
                <meta name="DC.relation.isPartOf">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/admin/numero/grtheme/theme)"/>
                    </xsl:attribute>
                </meta>
                </xsl:if>
                
                <!--Utilisation de MARCREL pour spécifier le rôle du "contributeur" en Dublin core
    drt = director -->
                <meta name="director">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(concat(article/admin/revue/directeur/nompers/prenom, ' ', article/admin/revue/directeur/nompers/nomfamille))"/>
                    </xsl:attribute>
                </meta>
                <meta name="DC.contributor.drt">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(concat(article/admin/revue/directeur/nompers/prenom, ' ', article/admin/revue/directeur/nompers/nomfamille))"/>
                    </xsl:attribute>
                </meta>
                <meta name="MARCREL.drt">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(concat(article/admin/revue/directeur/nompers/prenom, ' ', article/admin/revue/directeur/nompers/nomfamille))"/>
                    </xsl:attribute>
                </meta>
                
                <!--Auteur(s) de l'article -->
                <xsl:if test="article/liminaire/grauteur">
                    <xsl:for-each select="article/liminaire/grauteur/auteur">
                        <meta name="author">
                            <xsl:attribute name="content">
                                <xsl:value-of select="normalize-space(concat(./nompers/prenom, ' ', ./nompers/nomfamille))"/>
                            </xsl:attribute>
                        </meta>
                        <meta name="DC.creator">
                            <xsl:attribute name="content">
                                <xsl:value-of select="normalize-space(concat(./nompers/prenom, ' ', ./nompers/nomfamille))"/>
                            </xsl:attribute>
                        </meta>
                    </xsl:for-each>
                </xsl:if>
                
                <!--Rédacteur(s)-en-chef du dossier -->
                <xsl:if test="article/admin/numero/grtheme">
                    <xsl:for-each select="article/admin/revue/redacteurchef">
                        <meta name="DC.contributor.edt">
                            <xsl:attribute name="content">
                                <xsl:value-of select="normalize-space(concat(./nompers/prenom, ' ', ./nompers/nomfamille))"/>
                            </xsl:attribute>
                        </meta>
                        <meta name="MARCREL.edt">
                            <xsl:attribute name="content">
                                <xsl:value-of select="normalize-space(concat(./nompers/prenom, ' ', ./nompers/nomfamille))"/>
                            </xsl:attribute>
                        </meta>
                    </xsl:for-each>
                </xsl:if>
                
                <!--Résumés -->
                <xsl:if test="article/liminaire/resume">
                    <xsl:for-each select="article/liminaire/resume">
                <meta name="description">
                    <xsl:attribute name="xml:lang">
                        <xsl:value-of select="./@lang"/>
                    </xsl:attribute>
                    <xsl:attribute name="lang">
                        <xsl:value-of select="./@lang"/>
                    </xsl:attribute>
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(./alinea)"/>
                    </xsl:attribute>
                </meta>
                    </xsl:for-each>
                </xsl:if>
                
                <!--Mots clés auteurs -->
                <xsl:if test="article/liminaire/grmotcle">
                    <xsl:for-each select="article/liminaire/grmotcle">
                        <meta name="keywords">
                            <xsl:attribute name="xml:lang">
                                <xsl:value-of select="./@lang"/>
                            </xsl:attribute>
                            <xsl:attribute name="lang">
                                <xsl:value-of select="./@lang"/>
                            </xsl:attribute>
                            <xsl:attribute name="content">
                                <xsl:value-of select="normalize-space(string-join(./motcle, ', '))"/>
                            </xsl:attribute>
                        </meta>
                    </xsl:for-each>
                </xsl:if>
                
                <!--Mots clés éditeurs -->
                <xsl:if test="article/admin/infoarticle/grdescripteur">
                    <xsl:for-each select="article/admin/infoarticle/grdescripteur/descripteur">
                        <meta name="DC.subject" xml:lang="fr" lang="fr">
                            <xsl:attribute name="content">
                                <xsl:value-of select="node()"/>
                            </xsl:attribute>
                        </meta>
                    </xsl:for-each>
                </xsl:if>
                
                
      <!--PRISM schema - Publishing Requirements for Industry Standard Metadata - Schema specialise pour les revues et journaux-->
                <meta name="prism.publicationName">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/admin/revue/titrerev)"/>
                    </xsl:attribute>
                </meta>
                <meta name="prism.corporateEntity">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/admin/editeur/nomorg)"/>
                    </xsl:attribute>
                </meta>
                
                <xsl:if test="article/admin/numero/grtheme">
                <meta name="prism.issueName">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/admin/numero/grtheme/theme)"/>
                    </xsl:attribute>
                </meta>
                </xsl:if>
                
                <meta name="prism.publicationDate">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/admin/numero/pubnum/date)"/>
                    </xsl:attribute>
                </meta>
                
                <meta name="prism.genre">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/liminaire/grtitre/surtitre2)"/>
                    </xsl:attribute>
                </meta>
                
                <meta name="prism.issn">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/admin/revue/idissnnum)"/>
                    </xsl:attribute>
                </meta>
                
                
                <!--RDFa pour ajout des métadonnées DC-->
                <meta property="dc:format" content="text/html" />
                <meta property="dc:identifier">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/admin/revue/idissnnum)"/>
                    </xsl:attribute>
                </meta>
                <meta property="dc:title">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/liminaire/grtitre/titre)"/>
                    </xsl:attribute>
                </meta>
                
                <meta property="dc:title.Main">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/liminaire/grtitre/titre)"/>
                    </xsl:attribute>
                </meta>
                
                <xsl:if test="article/liminaire/grtitre/sstitre">
                    <meta property="dc:title.Subtitle">
                        <xsl:attribute name="content">
                            <xsl:value-of select="normalize-space(article/liminaire/grtitre/sstitre)"/>
                        </xsl:attribute>
                    </meta>
                </xsl:if>
                <meta property="dc:publisher">
                <xsl:attribute name="content">
                    <xsl:value-of select="normalize-space(article/admin/editeur/nomorg)"/>
                </xsl:attribute>
                </meta>
                <meta property="dc:language">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/@lang)"/>
                    </xsl:attribute>
                </meta>
                <meta property="dc:type" content="journalArticle" />
                <meta property="dcterm:created">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/admin/numero/pubnum/date)"/>
                    </xsl:attribute>
                </meta>
                
                <meta property="dc:rights">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/admin/droitsauteur)"/>
                    </xsl:attribute>
                </meta>
                
                <xsl:if test="article/admin/numero/grtheme">
                    <meta property="dc:relation.isPartOf">
                        <xsl:attribute name="content">
                            <xsl:value-of select="normalize-space(article/admin/numero/grtheme/theme)"/>
                        </xsl:attribute>
                    </meta>
                </xsl:if>
                
                <meta property="dc:source">
                    <xsl:attribute name="content">
                        <xsl:value-of select="normalize-space(article/admin/revue/titrerev)"/>
                    </xsl:attribute>
                </meta>
                
                <xsl:if test="article/liminaire/grauteur">
                    <xsl:for-each select="article/liminaire/grauteur/auteur">
                        <meta property="dc:creator">
                            <xsl:attribute name="content">
                                <xsl:value-of select="normalize-space(concat(./nompers/prenom, ' ', ./nompers/nomfamille))"/>
                            </xsl:attribute>
                        </meta>
                    </xsl:for-each>
                </xsl:if>
                
                <xsl:if test="article/liminaire/resume">
                    <xsl:for-each select="article/liminaire/resume">
                        <meta property="dcterms:abstract">
                            <xsl:attribute name="xml:lang">
                                <xsl:value-of select="./@lang"/>
                            </xsl:attribute>
                            <xsl:attribute name="lang">
                                <xsl:value-of select="./@lang"/>
                            </xsl:attribute>
                            <xsl:attribute name="content">
                                <xsl:value-of select="normalize-space(./alinea)"/>
                            </xsl:attribute>
                        </meta>
                    </xsl:for-each>
                </xsl:if>
                
                <xsl:if test="article/admin/infoarticle/grdescripteur">
                    <xsl:for-each select="article/admin/infoarticle/grdescripteur/descripteur">
                        <meta property="dc:subject" xml:lang="fr" lang="fr">
                            <xsl:attribute name="content">
                                <xsl:value-of select="node()"/>
                            </xsl:attribute>
                        </meta>
                    </xsl:for-each>
                </xsl:if>
                
                <!--Fin des métadonnées dans le Head-->
                
                <!--Balise Title pour affichage titre dans le navigateur-->
                <title>
                    <xsl:value-of select="normalize-space(article/liminaire/grtitre/titre)"/>
                </title>
                
                <!--style et lien vers CSS-->
                <style type="text/css">
                    code {
                    white-space: pre;
                    }</style>
            </head>
            <body>
                
                
                <!--indexations FOAF-->
                
                <div class="indexations-foaf">
                    
                    <!--indexation FOAF pour auteur de l'article-->
                    <xsl:if test="article/liminaire/grauteur">
                        <xsl:for-each select="article/liminaire/grauteur/auteur">
                            <div property="http://purl.org/dc/terms/creator">
                                <div vocab="http://xmlns.com/foaf/0.1/" typeof="Person" class="foaf-author">
                                    <span property="familyName"><xsl:value-of select="./nompers/nomfamille"/></span>
                                    <span property="firstName"><xsl:value-of select="./nompers/prenom"/></span>
                                </div>
                            </div>
                        </xsl:for-each>
                    </xsl:if>
                    
                    <!--indexation FOAF pour redacteur du dossier-->
                    <xsl:if test="article/admin/numero/grtheme">
                        <xsl:for-each select="article/admin/revue/redacteurchef">
                            <div property="http://purl.org/dc/terms/contributor.edt">
                                <div vocab="http://xmlns.com/foaf/0.1/" typeof="Person" class="foaf-redactor">
                                    <span property="familyName"><xsl:value-of select="./nompers/nomfamille"/></span>
                                    <span property="firstName"><xsl:value-of select="./nompers/prenom"/></span>
                                    <xsl:if test="./@sexe">
                                        <span property="gender"><xsl:value-of select="./@sexe"/></span>
                                    </xsl:if>
                                </div>
                            </div>
                        </xsl:for-each>
                    </xsl:if>
                    
                    <!--indexation FOAF pour directeur de la revue-->
                    <div property="http://purl.org/dc/terms/contributor.drt">
                        <div vocab="http://xmlns.com/foaf/0.1/" typeof="Person" class="foaf-director">
                            <span property="familyName"><xsl:value-of select="article/admin/revue/directeur/nompers/nomfamille"/></span>
                            <span property="firstName"><xsl:value-of select="article/admin/revue/directeur/nompers/prenom"/></span>
                            <span property="gender"><xsl:value-of select="article/admin/revue/directeur/@sexe"/></span>
                        </div>
                    </div>
                </div>
                
                
                <!-- article et parties annexes -->
                
                <xsl:apply-templates select=".//corps"/>
                <xsl:if test=".//partiesann/grbiblio">
                    <xsl:apply-templates select=".//partiesann/grbiblio/node()"/>
                </xsl:if>
                <xsl:if test=".//partiesann/grnote">
                        <div class="footnotes">
                            <hr/>
                            <ol>
                                <xsl:for-each select=".//partiesann/grnote/note">
                                <li>
                                    <xsl:attribute name="id">
                                        <xsl:value-of select="concat('fn', ./no)"/>
                                    </xsl:attribute>
                                    <p>
                                        <xsl:apply-templates select="./alinea/node()"/>
                                    </p>
                                </li>
                                </xsl:for-each>
                            </ol>
                        </div>
                </xsl:if>
            </body>
        </html>
    </xsl:template>
    
    <xsl:template match="corps">
        <div class="article">
           <xsl:apply-templates />
        </div>
    </xsl:template>   
    
    <xsl:template match="//section1">
            <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="//section2">
            <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="//section3">
            <xsl:apply-templates/>
    </xsl:template>
   
    <xsl:template match="//section1/titre">
        <h2>
            <xsl:apply-templates/>
        </h2>
    </xsl:template>
    
    <xsl:template match="//section2/titre">
        <h3>
            <xsl:apply-templates/>
        </h3>
    </xsl:template>
    
    <xsl:template match="//section3/titre">
        <h4>
            <xsl:apply-templates/>
        </h4>
    </xsl:template>

    <xsl:template match="para">
        <p>
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    
    <xsl:template match="epigraphe">
        <p>
            <xsl:apply-templates/>
        </p>
    </xsl:template>

    <xsl:template match="para/alinea">
        <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="marquage[normalize-space(@typemarq) = 'italique']">
    <em>
        <xsl:apply-templates/>
    </em>
    </xsl:template>
    
    <xsl:template match="marquage[normalize-space(@typemarq) = 'gras']">
        <strong>
            <xsl:apply-templates/>
        </strong>
    </xsl:template>
    
    <xsl:template match="exposant"> 
        <sup>
            <xsl:apply-templates/>
        </sup>
    </xsl:template>
    
    <xsl:template match="indice">
        <sub>
            <xsl:apply-templates/>
        </sub>
    </xsl:template>
    
    <xsl:template match="bloccitation">
        <blockquote>
            <xsl:apply-templates/>
        </blockquote>
    </xsl:template>
    
    <xsl:template match="bloccitation//alinea">
        <p>
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    
    <xsl:template match="elemliste//alinea">
        <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="listeord">
            <ol>
            <xsl:apply-templates/>
        </ol>
    </xsl:template>
    
    <xsl:template match="listenonord">
        <ul>
            <xsl:apply-templates/>
        </ul>
    </xsl:template>
    
    <xsl:template match="elemliste">
        <li>
             <xsl:apply-templates/>
        </li>
    </xsl:template>
    
    <xsl:template match="source">
        <p class="source">
            <xsl:apply-templates/>
        </p>
    </xsl:template>
   
    <xsl:template match="renvoi">
        <a class="footnoteRef">
            <xsl:attribute name="href">
                <xsl:value-of select="normalize-space(concat('#fn', substring-before(substring-after(@idref, 'sdfootnote'),'sym')))"/>
            </xsl:attribute>
            <xsl:attribute name="id">
                <xsl:value-of select="normalize-space(concat('fnfref', substring-before(substring-after(@idref, 'sdfootnote'),'sym')))"/>
            </xsl:attribute>
            <sup>
            <xsl:apply-templates/>
            </sup>
        </a>
    </xsl:template>
    
    <xsl:template match="liensimple">
            <a class="uri" href="{@xlink:href}">
            <xsl:apply-templates/>
                </a>
    </xsl:template>
    
    
    <xsl:template match="//figure">
            <div class="figure">
                <xsl:if test="descendant::legende">
                    <p class="caption">
                        <xsl:apply-templates select="descendant::legende/alinea/node()"/>
                    </p>
                </xsl:if>
                <xsl:if test="/objetmedia">
                    <xsl:apply-templates/>
                </xsl:if>
                <xsl:if test="descendant::image">
                    <xsl:for-each select="descendant::image">
                    <img>
                        <xsl:attribute name="src">
                            <xsl:value-of
                                select="normalize-space(concat('.//media/', ./@id))"
                            />
                        </xsl:attribute>
                    </img>
                    </xsl:for-each>
                </xsl:if>
                <xsl:if test="descendant::source">
                    <p class="source">
                        <xsl:apply-templates select="descendant::source/node()"/>
                    </p>
                </xsl:if>
            </div>
    </xsl:template>
    
    <xsl:template match="//biblio">
        <div id="refs" class="references">
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    
    <xsl:template match="//biblio/titre">
        <h2 id="bibliographie" class="unnumbered">
            <xsl:apply-templates/>
        </h2>
    </xsl:template>
    
    <xsl:template match="//biblio//divbiblio">
        <div class="references">
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    
    <xsl:template match="//biblio//divbiblio/titre">
        <h3>
            <xsl:apply-templates/>
        </h3>
    </xsl:template>
    
    <xsl:template match="//biblio//refbiblio">
        <p>
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    
    <xsl:template match="*">
        <xsl:copy-of select="."/>
    </xsl:template>
   
</xsl:stylesheet>
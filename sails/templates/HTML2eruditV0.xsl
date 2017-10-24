<?xml version="1.0" encoding="UTF-8"?>

<!--Ce script sert pour transformer des html créés avec pandoc templateHtmlEruditV0.html5 vers eruditschema. 
@todo:
presque tout... ce n'est qu'une première version de test. par ex:
- déclarations namespaces: 
    - actuellement il faut enlever toutes les déclaration du html pour que ça marche
    - comment déclarer correctement un input HTML

- boucle mots clés  dans admin
- Titres niveaux 2 et 3 et suivants avec section (fonctionne pas)
- conserver espaces insécables
- images

-->
<xsl:stylesheet version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:html="http://www.w3.org/1999/xhtml"
    xmlns:dc="http://purl.org/dc/elements/1.1/">
    <xsl:output method="xml"/>
    <xsl:template match="/">
<!--            traiter les diff. attributs de la balise racine notamment : 
            1. idproprio à récupérer chez erudit
            2. typeArticle
        -->
            <article xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.erudit.org/xsd/article"
                xsi:schemaLocation="http://www.erudit.org/xsd/article http://www.erudit.org/xsd/article/3.0.0/eruditarticle.xsd"
                qualtraitement="complet" idproprio="1904ear" typeart="essai" ordseq="1">
                <xsl:attribute name="lang"><xsl:value-of select="//meta[@name='DC.language']/@content"/></xsl:attribute>
<!--            valider l'attribut HTML < typeArticle dans YAML    <xsl:attribute name="typeart"><xsl:value-of select="//meta[@name='DC.type']/@content"/></xsl:attribute>-->
                <admin>
                    <infoarticle>
                        <idpublic scheme="doi">null</idpublic>
<!--Boucle grDescripteur pour récupérer les mots clés (DC.subject) -->
                        <grdescripteur lang="fr" scheme="http://rameau.bnf.fr">
                            <descripteur>meta-descripteur</descripteur>
                          
                        </grdescripteur>
                        <nbpara><xsl:value-of select="count(//p)"/></nbpara>
                        <nbmot> <xsl:value-of select=
                                        " string-length(normalize-space(//body))
                                        -
                                        string-length(translate(normalize-space(//body),' ','')) +1"/></nbmot>
                        <nbfig><xsl:value-of select="count(//figure)"/></nbfig>
                        <nbtabl><xsl:value-of select="count(//table)"/></nbtabl>
                        <nbimage><xsl:value-of select="count(//img)"/></nbimage>
<!--A tester avec un article contenant vidéo ou audio -->
                        <nbaudio><xsl:value-of select="count(//embed)"/></nbaudio>
                        <nbvideo><xsl:value-of select="count(//embed)"/></nbvideo>
                        <nbrefbiblio><xsl:value-of select="count(//div[@class='references']/div)"/></nbrefbiblio>
                        <nbnote><xsl:value-of select="count(//a[@class='footnoteRef'])"/></nbnote>
                    </infoarticle>
                    
                    <revue id="sp01868" lang="fr">
                        
                        <titrerev><xsl:value-of select="//meta[@name='DC.source']/@content"/></titrerev>
                      
                        <titrerevabr>sp</titrerevabr>
                        <idissnnum>2104-3272</idissnnum>
                        <directeur sexe="masculin">
<!--pour v2.0, récupérer le nom du directeur depuis la source -->
                            <nompers>
                                <prenom>Marcello</prenom>
                                <nomfamille>Vitali-Rosati</nomfamille>
                            </nompers>
                        </directeur>
                    </revue>
                    <numero id="prendre via api">
                        <pub>
                            <annee>
                                <xsl:variable name="dateValue" select="//meta[@name='DC.date']/@content"/>
                                <xsl:variable name="year" select="substring-before($dateValue,'-')"/>
                                <xsl:value-of select="$year"/>
                            </annee>
                        </pub>
<!--                        besoin de récupérer la date du numéro, à décider selon le numéro -->
                        <pubnum>
                            <date typedate="publication"><xsl:value-of select="//meta[@name='DC.date']/@content"/></date>
                        </pubnum>
                    </numero>
                    <editeur>
                        <nomorg>Département des littératures de langue française</nomorg>
                    </editeur>
                    <prod>
                        <nomorg>Sens public</nomorg>
                    </prod>
                    <prodnum>
                        <nomorg>Sens public</nomorg>
                    </prodnum>
                    <diffnum>
                        <nomorg>Sens public</nomorg>
                    </diffnum>
                   
                    <schema nom="Erudit Article" version="3.0.0" lang="fr"/>
                    <droitsauteur><xsl:value-of select="html/head/meta[@name='DC.rights']/@content"/></droitsauteur>
                </admin>
                <liminaire>
                    <grtitre>
                        <titre><xsl:value-of select="//title"/></titre>
                    </grtitre>
                    <grauteur>
<!-- A revoir après revue du template pour traiter nom/prénom -->
                        <xsl:for-each select="html/head/meta[@name='author']">
<!-- id à vérifier avec Erudit : vide ou à remplir selon comportement Quinoa -->
                            <auteur id=""> 
                            <nompers>
                                <prenom><xsl:value-of select="@forname"/></prenom>
                                <nomfamille><xsl:value-of select="@surname"/></nomfamille>
                            </nompers>
                        </auteur>
                        </xsl:for-each>
                    </grauteur>
                    <xsl:for-each select="//meta[@name='DC.description']">
                    <resume>
                        <xsl:attribute name="lang">
                            <xsl:value-of select="@lang"/>
                        </xsl:attribute>
                        <alinea><xsl:value-of select="@content"/></alinea>
                    </resume>
                    </xsl:for-each>
<!--grmotcle a revoir selon template DC -->
                    <grmotcle lang="fr">
                        <xsl:for-each select="html/head/meta[@name='controlledKeyword']">
                            <motcle><xsl:value-of select="@content"/></motcle>
                        </xsl:for-each>
                        
                    </grmotcle>
                </liminaire>
          
                <xsl:apply-templates/>
             
        </article>
    </xsl:template>

<!--TEMPLATES CORPS -->

    <xsl:template match="body">
        <corps>           
            <xsl:for-each-group select="*" group-starting-with="h2">
                <section1>
                    <xsl:apply-templates select="current-group()"/>
                </section1>
            </xsl:for-each-group>
        </corps>
    </xsl:template>

    <xsl:template match="h2">
        <titre>
            <xsl:apply-templates/>
        </titre>
    </xsl:template>
    
    <xsl:template match="p">
        <para>
            <alinea><xsl:apply-templates/></alinea>
        </para>
    </xsl:template>
    
    <xsl:template match="em">
        <marquage typemarq="italique">
            <xsl:apply-templates/>
        </marquage>
    </xsl:template>
    
    <xsl:template match="sup[../@class='footnoteRef']">
        <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="sup">
        <exposant>
            <xsl:apply-templates/>
        </exposant>
    </xsl:template>
    

<!--
    <xsl:template match="h2[@id='bibliographie']">
        <!-\-<xsl:variable name="id">
            <xsl:value-of select="generate-id()"/>
        </xsl:variable>-\->
        <grBiblio>
            <biblio>
                <titre>Bibliographie</titre>
            </biblio>
            <xsl:apply-templates/>
        </grBiblio>
    </xsl:template>-->
      

    <xsl:template match="figure">
        <figure>
            <objetmedia flot="bloc">
            <xsl:apply-templates/>
            </objetmedia>
        </figure>
        
    </xsl:template>
    
    <xsl:template match="img">
        <image>
                <xsl:apply-templates/>
            </image>       
    </xsl:template>
 
    <xsl:template match="div[@class='footnotes']">
        <partiesann><grnote>
        <xsl:apply-templates/>
        </grnote>
    </partiesann>
    </xsl:template>
    
    <xsl:template match="div[@class='footnotes']/ol">
       <xsl:for-each select="li">
           <note>
               <xsl:attribute name="id">
                   <xsl:value-of select="concat(concat('sdfootnote',substring-after(@id,'fn')),'sym')"/>
               </xsl:attribute>
               <no> <xsl:value-of select="position()" /></no><alinea><xsl:apply-templates/></alinea></note>
           </xsl:for-each>
        
    </xsl:template>
 
    <xsl:template match="blockquote">
        <bloccitation>
            <alinea><xsl:apply-templates/></alinea>
        </bloccitation>
    </xsl:template>

    <xsl:template match="a[@class='footnoteRef']">
        <renvoi>
            <xsl:attribute name="idref">
                <xsl:value-of select="concat(concat('sdfootnote',substring-after(@id,'fn')),'sym')"/>
            </xsl:attribute>
            <xsl:apply-templates/>
        </renvoi>
    </xsl:template>

    <xsl:template match="head">
        
    </xsl:template>

    <xsl:template match="node()|@*" mode="#all">
        <xsl:copy>
            <xsl:apply-templates select="node()|@*" mode="#current"/>
        </xsl:copy>
    </xsl:template>    

</xsl:stylesheet>


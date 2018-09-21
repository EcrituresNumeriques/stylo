<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:h="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="h" version="2.0" xpath-default-namespace="http://www.w3.org/1999/xhtml"
  xmlns="http://www.erudit.org/xsd/article">

  <xsl:template match="/">
    <article xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns="http://www.erudit.org/xsd/article"
      xsi:schemaLocation="http://www.erudit.org/xsd/article http://www.erudit.org/xsd/article/3.0.0/eruditarticle.xsd"
      qualtraitement="complet" idproprio="">
      <xsl:choose>
        <xsl:when
        test="contains('essai sommaire', html/head/meta[normalize-space(@name) = 'prism.genre']/lower-case(normalize-space(@content)))">
          <xsl:attribute name="typeart">article</xsl:attribute>
        </xsl:when>
        <xsl:when
          test="contains('lecture', html/head/meta[normalize-space(@name) = 'prism.genre']/lower-case(normalize-space(@content)))">
          <xsl:attribute name="typeart">compterendu</xsl:attribute>
        </xsl:when>
       <xsl:otherwise>
          <xsl:attribute name="typeart">autre</xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:attribute name="lang">
        <xsl:value-of select="html/head/meta[normalize-space(@name) = 'DC.language']/@content"/>
      </xsl:attribute>
      <xsl:for-each select="div[normalize-space(@resource) = '#issue']">
        <xsl:if test="span[normalize-space(@class) = 'titreDossier'] = 'varia'">
          <xsl:attribute name="horstheme">
            <xsl:value-of>oui</xsl:value-of>
          </xsl:attribute>
        </xsl:if>
      </xsl:for-each>
      <xsl:attribute name="ordseq"> </xsl:attribute>

      <admin>
        <infoarticle>
          <xsl:for-each select="html/body//div[normalize-space(@class) = 'keywords']">
            <grdescripteur>
              <xsl:attribute name="lang">
                <xsl:value-of select="//meta[normalize-space(@name) = 'DC.language']/@content"/>
              </xsl:attribute>
              <xsl:if test=".//span[normalize-space(@class) = 'idRameau']">
                <xsl:attribute name="scheme">http://rameau.bnf.fr</xsl:attribute>
              </xsl:if>
              <xsl:for-each select="./div">
                <descripteur>
                  <xsl:apply-templates select="span[normalize-space(@class) = 'label']"/>
                </descripteur>
              </xsl:for-each>
            </grdescripteur>
          </xsl:for-each>
          <nbpara>
            <xsl:value-of
              select="
                count(.//p[not(ancestor::div[
                contains(' figure references footnotes ',
                concat(' ', normalize-space(@class), ' '))
                ])])"
            />
          </nbpara>
          <nbmot>
            <xsl:variable name="temp" select="tokenize(string-join(.//p, ' '), '\s+')"/>
            <xsl:value-of select="count($temp)"/>
          </nbmot>
          <nbfig>
            <xsl:value-of select="count(.//div[normalize-space(@class) = 'figure'])"/>
          </nbfig>
          <nbtabl>
            <xsl:value-of select="count(.//table)"/>
          </nbtabl>
          <nbaudio>
            <xsl:value-of select="count(.//audio)"/>
          </nbaudio>
          <nbvideo>
            <xsl:value-of select="count(.//video)"/>
          </nbvideo>
          <nbrefbiblio>
            <xsl:value-of select="count(.//div[normalize-space(@class) = 'references']/div)"/>
          </nbrefbiblio>
          <nbnote>
            <xsl:value-of select="count(.//div[normalize-space(@class) = 'footnotes']/ol/li)"/>
          </nbnote>
        </infoarticle>
        
        <revue id="sp02131" lang="fr">
          <titrerev>
            <xsl:value-of select="html/head/meta[normalize-space(@name) = 'DC.source']/@content"/>
          </titrerev>
          <titrerevabr>sp</titrerevabr>
          <idissnnum>
            <xsl:value-of
              select="html/head/meta[normalize-space(@name) = 'DC.identifier' and normalize-space(@class) = 'issn']/@content"
            />
          </idissnnum>


          <xsl:for-each
            select="html/body/div[normalize-space(@class) = 'indexations-foaf']//div[normalize-space(@class) = 'foaf-director']">
            <directeur>
              <xsl:if test="span[normalize-space(@property) = 'gender'] = 'male'">
                <xsl:attribute name="sexe">
                  <xsl:value-of>masculin</xsl:value-of>
                </xsl:attribute>
              </xsl:if>
              <xsl:if test="span[normalize-space(@property) = 'gender'] = 'female'">
                <xsl:attribute name="sexe">
                  <xsl:value-of>feminin</xsl:value-of>
                </xsl:attribute>
              </xsl:if>
              <nompers>
                <prenom>
                  <xsl:value-of select="span[normalize-space(@property) = 'firstName']"/>
                </prenom>
                <nomfamille>
                  <xsl:apply-templates select="span[normalize-space(@property) = 'familyName']"/>
                </nomfamille>
              </nompers>
            </directeur>
          </xsl:for-each>

          <xsl:if
            test="html/body/div[normalize-space(@class) = 'indexations-foaf']//div[normalize-space(@class) = 'foaf-redactor']/span[normalize-space(@property) = 'firstName']/text()">
            <xsl:for-each
              select="html/body/div[normalize-space(@class) = 'indexations-foaf']//div[normalize-space(@class) = 'foaf-redactor']">
              <redacteurchef typerc="invite">
                <xsl:if test="span[normalize-space(@property) = 'gender'] = 'male'">
                  <xsl:attribute name="sexe">
                    <xsl:value-of>masculin</xsl:value-of>
                  </xsl:attribute>
                </xsl:if>
                <xsl:if test="span[normalize-space(@property) = 'gender'] = 'female'">
                  <xsl:attribute name="sexe">
                    <xsl:value-of>feminin</xsl:value-of>
                  </xsl:attribute>
                </xsl:if>
                <nompers>
                  <prenom>
                    <xsl:value-of select="span[normalize-space(@property) = 'firstName']"/>
                  </prenom>
                  <nomfamille>
                    <xsl:apply-templates select="span[normalize-space(@property) = 'familyName']"/>
                  </nomfamille>
                </nompers>
              </redacteurchef>
            </xsl:for-each>
          </xsl:if>

        </revue>

        <numero id="">
          <pub>
            <annee>
              <xsl:value-of
                select="html/head/meta[normalize-space(@name) = 'DC.date' and normalize-space(@class) = 'year']/@content"/>
            </annee>
          </pub>
          <pubnum>
            <date typedate="publication">
              <xsl:value-of
                select="html/head/meta[normalize-space(@name) = 'DC.date' and normalize-space(@class) = 'completeDate']/@content"/>
            </date>
          </pubnum>
        </numero>
        <editeur>
          <nomorg>
            <xsl:value-of
              select="html/head/meta[normalize-space(@name) = 'DC.publisher' and normalize-space(@class) = 'editeur']/@content"
            />
          </nomorg>
        </editeur>
        <prod>
          <nomorg>
            <xsl:value-of
              select="html/head/meta[normalize-space(@name) = 'DC.publisher' and normalize-space(@class) = 'producteur']/@content"
            />
          </nomorg>
        </prod>
        <prodnum>
          <nomorg>
            <xsl:value-of
              select="html/head/meta[normalize-space(@name) = 'DC.publisher' and normalize-space(@class) = 'producteurNum']/@content"
            />
          </nomorg>
        </prodnum>
        <diffnum>
          <nomorg>
            <xsl:value-of
              select="html/head/meta[normalize-space(@name) = 'DC.publisher' and normalize-space(@class) = 'diffuseur']/@content"
            />
          </nomorg>
        </diffnum>
        <schema nom="Erudit Article" version="3.0.0" lang="fr"/>
        <droitsauteur>
          <xsl:value-of select="html/head/meta[normalize-space(@name) = 'DC.rights']/@content"/>
        </droitsauteur>
      </admin>

      <liminaire>
        <grtitre>
          <xsl:if test="
              html/head/meta[normalize-space(@name) = 'DC.title']">
            <surtitre>
              <xsl:value-of
                select="
                  html/body//
                  span[normalize-space(@class) = 'titreDossier']"
              />
            </surtitre>
          </xsl:if>
          <surtitre2>
            <xsl:value-of
              select="
                html/head/meta[normalize-space(@name) = 'DC.type' and
                normalize-space(@class) = 'typeArticle']/@content"
            />
          </surtitre2>
          <titre>
            <xsl:apply-templates select="html/head/title/node()"/>
          </titre>
        </grtitre>

        <grauteur>
          <xsl:for-each select="html/body//div[normalize-space(@class) = 'foaf-author']">
            <auteur>
              <xsl:if
                test="html/body/div[normalize-space(@class) = 'indexations-foaf']//div[normalize-space(@class) = 'foaf-author']//span[normalize-space(@property) = 'gender'] = 'male'">
                <xsl:attribute name="sexe">
                  <xsl:value-of>masculin</xsl:value-of>
                </xsl:attribute>
              </xsl:if>
              <xsl:if
                test="html/body/div[normalize-space(@class) = 'indexations-foaf']//div[normalize-space(@class) = 'foaf-author']//span[normalize-space(@property) = 'gender'] = 'female'">
                <xsl:attribute name="sexe">
                  <xsl:value-of>feminin</xsl:value-of>
                </xsl:attribute>
              </xsl:if>
              <nompers>
                <prenom>
                  <xsl:apply-templates select="span[normalize-space(@property) = 'firstName']"/>
                </prenom>
                <nomfamille>
                  <xsl:apply-templates select="span[normalize-space(@property) = 'familyName']"/>
                </nomfamille>
              </nompers>
            </auteur>
          </xsl:for-each>
        </grauteur>
        
        
        <xsl:if test="html/head/meta[normalize-space(@name) = 'DC.description' and normalize-space(@lang) = 'fr']">
          <resume lang="fr">
            <alinea>
              <xsl:apply-templates select="html/head/meta[normalize-space(@name) = 'DC.description' and normalize-space(@lang) = 'fr']/@content"/>
            </alinea>
          </resume>
        </xsl:if>
        
        <xsl:if test="html/head/meta[normalize-space(@name) = 'DC.description' and normalize-space(@lang) = 'en']">
          <resume lang="en">
            <alinea>
              <xsl:apply-templates select="html/head/meta[normalize-space(@name) = 'DC.description' and normalize-space(@lang) = 'en']/@content"/>
            </alinea>
          </resume>
        </xsl:if>

        <xsl:if test="html/body//div[normalize-space(@class) = 'authorKeywords_fr']">
          <xsl:variable name="autkey" 
            select="normalize-space(
              html/body//div[normalize-space(@class) = 'authorKeywords_fr']/span[normalize-space(@property) = 'subject']/string())"/>
          <xsl:variable name="autkeypropre">
            <xsl:choose>
              <xsl:when test="substring($autkey, string-length($autkey)) = '.'">
                <xsl:value-of select="substring($autkey, 1, string-length($autkey)-1)"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="$autkey"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:variable>
          <grmotcle lang="fr">
            <xsl:for-each
              select="tokenize($autkeypropre, ', ')">
              <motcle>
                <xsl:value-of select="."/>
              </motcle>
            </xsl:for-each>
          </grmotcle>
        </xsl:if>


        <xsl:if test="html/body//div[normalize-space(@class) = 'authorKeywords_en']">
          <xsl:variable name="autkey" 
            select="normalize-space(
            html/body//div[normalize-space(@class) = 'authorKeywords_en']/span[normalize-space(@property) = 'subject']/string())"/>
          <xsl:variable name="autkeypropre">
            <xsl:choose>
              <xsl:when test="substring($autkey, string-length($autkey)) = '.'">
                <xsl:value-of select="substring($autkey, 1, string-length($autkey)-1)"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="$autkey"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:variable>
          <grmotcle lang="en">
            <xsl:for-each
              select="tokenize($autkeypropre, ', ')">
              <motcle>
                <xsl:value-of select="."/>
              </motcle>
            </xsl:for-each>
          </grmotcle>
        </xsl:if>
       
        <xsl:apply-templates select="html/head/meta[not(normalize-space(@name) = 'DC.subject')]"
          mode="liminaire"/>
      </liminaire>

      <xsl:apply-templates select=".//div[normalize-space(@class) = 'article']"/>

    </article>
  </xsl:template>

  <xsl:template match="meta" mode="liminaire"/>

  
  <xsl:template match="div[normalize-space(@class) = 'article']">
    <corps>
      <xsl:variable name="premEnf" select="*[1][not(self::h2[@id != 'bibliographie'])]"/>
      <xsl:if test="$premEnf">
        <xsl:variable name="longPropre">
          <xsl:call-template name="compte">
            <xsl:with-param name="de" select="$premEnf"/>
            <xsl:with-param name="jusque" select="' h2 '"/>
          </xsl:call-template>
        </xsl:variable>
        <section1>
          <xsl:apply-templates select="child::*[position() &lt;= $longPropre]"/>
        </section1>
      </xsl:if>
      <xsl:apply-templates select="h2[normalize-space(@id) != 'bibliographie']"/>
    </corps>
    <xsl:if
      test="h2[normalize-space(@id) = 'bibliographie'] | div[normalize-space(@class) = 'references'] | div[normalize-space(@class) = 'footnotes']">
      <partiesann>
        <xsl:attribute name="lang">
          <xsl:value-of select="//meta[normalize-space(@name) = 'DC.language']/@content"/>
        </xsl:attribute>
        <xsl:apply-templates select="div[normalize-space(@class) = 'references']"/>
        <xsl:apply-templates select="div[normalize-space(@class) = 'footnotes']"/>
      </partiesann>
    </xsl:if>
  </xsl:template>

  <xsl:template match="h2[normalize-space(@id) != 'bibliographie']">
    <xsl:variable name="longTot">
      <xsl:call-template name="compte">
        <xsl:with-param name="de" select="."/>
        <xsl:with-param name="jusque" select="' h2 '"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="longPropre">
      <xsl:call-template name="compte">
        <xsl:with-param name="de" select="."/>
        <xsl:with-param name="jusque" select="' h3 h2 '"/>
      </xsl:call-template>
    </xsl:variable>
    <section1>
      <titre>
        <xsl:apply-templates/>
      </titre>
      <xsl:apply-templates select="following-sibling::*[position() &lt; $longPropre]"/>
      <xsl:apply-templates select="following-sibling::*[self::h3 and (position() &lt; $longTot)]"/>
    </section1>
  </xsl:template>

  <xsl:template match="h3">
    <xsl:variable name="longTot">
      <xsl:call-template name="compte">
        <xsl:with-param name="de" select="."/>
        <xsl:with-param name="jusque" select="' h3 h2 '"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="longPropre">
      <xsl:call-template name="compte">
        <xsl:with-param name="de" select="."/>
        <xsl:with-param name="jusque" select="' h4 h3 h2 '"/>
      </xsl:call-template>
    </xsl:variable>
    <section2>
      <titre>
        <xsl:apply-templates/>
      </titre>
      <xsl:apply-templates select="following-sibling::*[position() &lt; $longPropre]"/>
      <xsl:apply-templates select="following-sibling::*[self::h4 and (position() &lt; $longTot)]"/>
    </section2>
  </xsl:template>
  
  <xsl:template match="h4">
    <xsl:variable name="longTot">
      <xsl:call-template name="compte">
        <xsl:with-param name="de" select="."/>
        <xsl:with-param name="jusque" select="' h4 h3 h2 '"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="longPropre">
      <xsl:call-template name="compte">
        <xsl:with-param name="de" select="."/>
        <xsl:with-param name="jusque" select="' h4 h3 h2 '"/>
      </xsl:call-template>
    </xsl:variable>
    <section3>
      <titre>
        <xsl:apply-templates/>
      </titre>
      <xsl:apply-templates select="following-sibling::*[position() &lt; $longPropre]"/>
      <xsl:apply-templates select="following-sibling::*[self::h4 and (position() &lt; $longTot)]"/>
    </section3>
  </xsl:template>
  

  <xsl:template match="p[not(ancestor::div[normalize-space(@class) = 'references'])]">
    <para>
      <alinea>
        <xsl:apply-templates/>
      </alinea>
    </para>
  </xsl:template>

  <xsl:template match="p[ancestor::div[normalize-space(@class) = 'references']]">
    <xsl:apply-templates select="node()"/>
  </xsl:template>


  <xsl:template match="//div[normalize-space(@class) = 'figure']">
    <xsl:if test="//div[normalize-space(@class) = 'figure']">
    <figure>
      <xsl:if test="descendant::p[normalize-space(@class) = 'caption']">
        <legende>
          <xsl:attribute name="lang">
            <xsl:value-of select="//meta[normalize-space(@name) = 'DC.language']/@content"/>
          </xsl:attribute>
          <alinea>
            <xsl:apply-templates select="p[normalize-space(@class) = 'caption']/node()"/>
          </alinea>
        </legende>
      </xsl:if>
      <xsl:if test="descendant::img">
        <objetmedia flot="bloc">
          <xsl:for-each select="descendant::img">
            <image>
              <xsl:attribute name="id">
                <xsl:value-of
                  select="normalize-space(substring-after(@src, 'media/'))"
                />
              </xsl:attribute>
              <xsl:attribute name="typeimage">
                <xsl:value-of>figure</xsl:value-of>
              </xsl:attribute>
              <xsl:attribute name="xlink:type">
                <xsl:value-of>simple</xsl:value-of>
              </xsl:attribute>
            </image>
          </xsl:for-each>
        </objetmedia>
      </xsl:if>
      <xsl:if test="/p[normalize-space(@class) = 'source']">
        <source>
          <xsl:apply-templates select="/p[normalize-space(@class) = 'source']/node()"/>
        </source>
      </xsl:if>
    </figure>
    </xsl:if>
  </xsl:template>

  <xsl:template match="ol">
    <listenonord signe="cercle">
      <xsl:apply-templates/>
    </listenonord>
  </xsl:template>

  <xsl:template match="ul">
    <listenonord signe="cercle">
      <xsl:apply-templates/>
    </listenonord>
  </xsl:template>

  <xsl:template
    match="div[normalize-space(@class) = 'article']/p/ul/li | div[normalize-space(@class) = 'article']/ul/li">
    <elemliste>
      <alinea>
        <xsl:apply-templates/>
      </alinea>
    </elemliste>
  </xsl:template>

  <xsl:template match="blockquote//p | li//p">
    <alinea>
      <xsl:apply-templates/>
    </alinea>
  </xsl:template>

  <xsl:template match="blockquote">
    <bloccitation>
      <xsl:apply-templates/>
    </bloccitation>
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

  <xsl:template match="sub">
    <indice>
      <xsl:apply-templates/>
    </indice>
  </xsl:template>

  <xsl:template match="b">
    <marquage typemarq="gras">
      <xsl:apply-templates/>
    </marquage>
  </xsl:template>
  
  <xsl:template match="strong">
    <marquage typemarq="gras">
      <xsl:apply-templates/>
    </marquage>
  </xsl:template>

  <xsl:template match="span">
    <xsl:apply-templates/>
  </xsl:template>
  
  <xsl:template match="br">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="hr">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="a">
    <xsl:choose>
      <xsl:when test="./@href[starts-with(., '#ref-')]">
        <xsl:apply-templates/>
      </xsl:when>
      <xsl:otherwise>
        <liensimple xlink:type="simple" xlink:href="{@href}">
          <xsl:apply-templates/>
        </liensimple>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="*">
    <xsl:copy-of select="."/>
  </xsl:template>

  <xsl:template name="compte">
    <xsl:param name="de"/>
    <xsl:param name="jusque"/>
    <xsl:choose>
      <xsl:when test="$de">
        <xsl:variable name="decompte">
          <xsl:call-template name="compte">
            <xsl:with-param name="de"
              select="
                $de/following-sibling::*[1][not(contains($jusque,
                concat(' ', name(), ' ')))]"/>
            <xsl:with-param name="jusque" select="$jusque"/>
          </xsl:call-template>
        </xsl:variable>
        <xsl:value-of select="1 + $decompte"/>
      </xsl:when>
      <xsl:otherwise>0</xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="html/body//div[normalize-space(@class) = 'footnotes']">
    <grnote>
      <xsl:apply-templates select="ol"/>
    </grnote>
  </xsl:template>

  <xsl:template match="html/body//div[normalize-space(@class) = 'footnotes']/ol">
    <xsl:for-each select="li">
      <note>
        <xsl:attribute name="id">
          <xsl:value-of select="concat('sdfootnote', substring-after(@id, 'fn'), 'sym')"/>
        </xsl:attribute>
        <no>
          <xsl:value-of select="position()"/>
        </no>
        <xsl:apply-templates/>
      </note>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="a[normalize-space(@class) = 'footnoteRef']">
    <renvoi typeref="note">
      <xsl:attribute name="idref">
        <xsl:value-of select="concat('sdfootnote', substring-after(@id, 'fnref'), 'sym')"/>
      </xsl:attribute>
      <xsl:apply-templates/>
    </renvoi>
  </xsl:template>

  <xsl:template
    match="
      html/body//div[normalize-space(@class) =
      'footnotes']//p/a[not(following-sibling::* | following-sibling::text()[normalize-space()])]"/>

  <xsl:template match="div[normalize-space(@class) = 'references']">
    <grbiblio>
      <biblio>
        <titre>Bibliographie</titre>
        <xsl:for-each select="div">
          <refbiblio>
            <xsl:apply-templates select="node()"/>
          </refbiblio>
        </xsl:for-each>
      </biblio>
    </grbiblio>
    
  </xsl:template>
 

</xsl:stylesheet>

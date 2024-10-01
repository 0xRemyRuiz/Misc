// ==UserScript==
// @name        Udemy course notation
// @namespace   Violentmonkey Scripts
// @match       *://www.udemy.com/course/*
// @grant       none
// @version     0.1
// @author      - 0xRemyRuiz
// @description 01/05/2024, 13:41:31
// ==/UserScript==

window._DEBUG_ = true;

(() => {
  'use strict';


  let qualityToggleBoxStyle = 'min-width:60px;position:fixed;bottom:0;right:0;z-index:99999;background-color:black;padding:3px 5px;';
  qualityToggleBoxStyle += 'color:white;font-size:1.15em;text-align:center;cursor:pointer';
  const qualityToggleBoxContentHTML = `<div id="monkey-custom-rating-course" style="${qualityToggleBoxStyle}">Rating</div>`;

  const qualityToggleBox = document.createElement('div');

  qualityToggleBox.innerHTML = qualityToggleBoxContentHTML;

  document.body.appendChild(qualityToggleBox.firstChild);

  document.addEventListener('click', e => {
    if (e.target.matches('#monkey-custom-rating-course')) {
      console.log(window._DEBUG_);
      // n = notation from reviewers (rating)
      // r = total number of reviewers
      // s = total number of students
      // m = total number of minutes of content
      // l = total number of lectures
      // d = total downloadable ressources
      // a = total of articles
      // p = price
      const quality = (n, r, s, m, l, d, a, p) => {
        if (window._DEBUG_) console.log(`Quality(n, r, s, m, l, d, a, p) were : (${n}, ${r}, ${s}, ${m}, ${l}, ${d}, ${a}, ${p}) `);
        const precision = 1e3;
        // mandatory values
        //if ((n < 0 || n > 5) && r > 0) return -1; // error
        if (m < 10 || l < 1) return -1; // error
        // if (s < 0) return -1; // error

        // set neutral default values
        n = n ? n : 2.5;
        r = r ? r : 1;
        s = s ? s : 1;
        d = d ? d : 0; // added value
        a = a ? a : 0; // added value
        p = p ? p : 1; // devided value


        // TODO: maybe rework the algo??
        //       - better weight content to price ratio
        //       - mean value of teachers rating
        //       - study more the relation between big numbers and rating droping down (tends to 4.5?)
        let score = 1;

        // rating experiments below
        /*/score *= n * r / s;
        score += Math.log(s);/**/
        //score *= n * Math.log(s + r / s);
        // alpha = rate decay constant for
        // const alpha = .5;
        //score += (.6 * m * Math.exp(-alpha * l));
        //score += (.6 * m / l);
        /*/
        let contentScore = 1;
        contentScore *= m * Math.log(1 + (m / l));
        contentScore *= Math.log(1 + (.5 * d));
        contentScore *= Math.log(1 + (.8 * a));
        contentScore /= (p * .3); // content is weighted by the price
        // add the content score to the score
        score *= Math.log(1 + contentScore);/**/

        /**/
        score *= n * n * n * Math.log(.1 + r) * Math.log(1 + (r / s));
        score *= Math.log(m * 60) * (Math.log(m / l));
        score += Math.round(2.5 * d);
        score += Math.round(1.5 * a);
        score *= 10; // limits the impact of a very bad content to price ratio
        score /= p;/**/

        return Math.round(Math.log(1 + score) * precision) / precision;
      }

      const getScore = () => {

        const langObj = {
          'en': ['lecture.*', 'downloadable resource', 'article'],
          'fr': ['session.*', 'ressource.* téléchargeable.*', 'article.*'],
          'de': ['Lektion.*', 'zum Download verfügbare.* Material.*', 'Artikel'],
          'es': ['clas.*', 'recurso.* descargable.*', 'artículo.*'],
          'id': ['pelajaran', 'sumber daya yang dapat diunduh', 'artikel'],
          'it': ['lezion.*', 'risors.* scaricabil.*', 'articol.*'],
          'jp': ['レクチャーの数:', '個のダウンロード可能なリソース', '件の記事'],
          'cn': ['个讲座', '个可下载资源', '篇文章'],
          'cnt': ['堂講座', '個可下載的資源', '篇文章'],
          'kr': ['개의 강의', '개의 다운로드 가능 리소스', '관련 글 2개'], // korean seems to do similar to polish with plural (TOIMPRV)
          'nl': ['college.*', 'bron.* die k.* worden gedownload', 'artikel.*'],
          'pl': ['Wykłady: ', 'zasób do pobrania: | zasób do pobrania', 'artykuły: | artykuł'], // polish reverse order when plural is in play, not fixing for now (TODO)
          'pt': ['aula.*', 'recurso.* para download', 'artigo.*'],
          'ro': ['lecți.*', 'resurs.* descărcabil.*', 'articol.*'],
          'ru': ['лекций', 'ресурс.* для скачивания', 'стат.*'],
          'th': ['การบรรยาย', 'แหล่งข้อมูลที่ดาวน์โหลดได้', 'บทความ'],
          'tr': ['ders', 'indirilebilir kaynak', 'makale'],
          'vn': ['bài giảng', 'tài nguyên có thể tải xuống', 'bài viết'],
        }
        // total number of students (UNUSED)
        //parseInt($('#main-content-anchor div.clp-lead__badge-ratings-enrollment div.enrollment').innerHTML.replace(/[^0-9]/g, ""))

        // TODO: maybe try to return error in a useful meaningful way so if the layout changes and breaks the script I'm able to fix it...
        try {
          // try to detect the language of the page
          const firstSentence = document.querySelector('#main-content-anchor .component-margin > h2').innerHTML;
          const l = (() => {
            if (firstSentence.match(/.*What you'll learn.*/i)) return 'en';
            if (firstSentence.match(/.*Ce que vous apprendrez.*/i)) return 'fr';
            if (firstSentence.match(/.*Das wirst du lernen.*/i)) return 'de';
            if (firstSentence.match(/.*Lo que aprenderás.*/i)) return 'es';
            if (firstSentence.match(/.*Yang akan Anda pelajari.*/i)) return 'id';
            if (firstSentence.match(/.*Cosa imparerai.*/i)) return 'it';
            if (firstSentence.match(/.*学習内容.*/i)) return 'jp';
            if (firstSentence.match(/.*你将会学到的.*/)) return 'cn';
            if (firstSentence.match(/.*您會學到.*/)) return 'cnt';
            if (firstSentence.match(/.*배울 내용.*/)) return 'kr';
            if (firstSentence.match(/.*Wat je leert.*/)) return 'nl';
            if (firstSentence.match(/.*Czego się nauczysz.*/)) return 'pl'; // polish is absolutely broken see above
            if (firstSentence.match(/.*O que você aprenderá.*/)) return 'pt';
            if (firstSentence.match(/.*Ce vei învăța.*/)) return 'ro';
            if (firstSentence.match(/.*Чему вы научитесь.*/)) return 'ru';
            if (firstSentence.match(/.*สิ่งที่คุณจะได้เรียนรู้.*/)) return 'th';
            if (firstSentence.match(/.*Öğrenecekleriniz.*/)) return 'tr';
            if (firstSentence.match(/.*Nội dung bài học.*/)) return 'vn';
          })()
          if (window._DEBUG_) console.log(`Detected language is : ${l}`);
          const lang = langObj[l];

           // japanese has reverse logic here
          const infosRegex = l == 'jp' ? `${lang[0]} *(\\d+).+<span>.*<span>([^<]+)` : `(\\d+) *${lang[0]}.+<span>.*<span>([^<]+)`;
          const infosMatch = document.querySelector('#main-content-anchor span.curriculum--content-length--V3vIz').innerHTML.match(new RegExp(infosRegex, 'i'));
          if (!infosMatch) {
            if (window._DEBUG_) console.log(`ERROR fetching infosMatch using ${infosRegex} infoRegex`);
            return -1;
          }
          const timeMatch = infosMatch[2].match(/(\d+[^\d]+)?(\d+)/);
          if (!timeMatch) {
            if (window._DEBUG_) console.log('ERROR while fetching infosMatch');
            return -1;
          }
          const hours = timeMatch[1] ? parseInt(timeMatch[1].replace(/[^\d]/g, '')) : 0;
          const minutes = parseInt(timeMatch[2]);

          const totalEnrolledStudents = parseInt(document.querySelector('#main-content-anchor div.clp-lead__badge-ratings-enrollment div.enrollment').innerHTML.replace(/[^0-9]/g, ""));

          const incentiveListElem = document.querySelector('div.component-margin ul.incentive-list');
          const downloadableResRegex = `(\\d+) *${lang[1]}`;
          const downloadableResMatch = incentiveListElem.innerHTML.match(new RegExp(downloadableResRegex, 'i'));
          console.log(new RegExp(downloadableResRegex, 'i'));
          const downloadableRes = downloadableResMatch ? parseInt(downloadableResMatch[1]) : 0;
          const articlesNumberRegex = `(\\d+) *${lang[2]}`;
          const articlesNumberMatch = incentiveListElem.innerHTML.match(new RegExp(articlesNumberRegex, 'i'));
          const articlesNumber = articlesNumberMatch ? parseInt(articlesNumberMatch[1]) : 0;

          const priceMatch = document.querySelector('.ud-clp-price-text').innerHTML.replace(/,/, '.').match(/([\d\.]+)/);
          const price = priceMatch ? parseFloat(priceMatch[1]) : -1;
          if (window._DEBUG_) console.log('Price seems to be: '+price);

          return quality(
            // float rating score
            parseFloat(document.querySelector('#main-content-anchor div.clp-lead__badge-ratings-enrollment span.star-rating-module--rating-number--2-qA2').textContent.replace(',', '.')),
            // int total number of reviewers
            parseInt(document.querySelector('#main-content-anchor div.clp-lead__badge-ratings-enrollment a.ud-btn-link.ud-heading-md.ud-text-sm').lastChild.innerHTML.replace(/[^0-9]/g, '')),
            totalEnrolledStudents,
            (hours ? hours : 0) * 60 + minutes,
            // total number of lectures
            infosMatch[1],
            downloadableRes,
            articlesNumber,
            price
          );
        } catch(err) {
          console.log('error fetching infos');
        }
        return 'No Rating'
      }

      const getColorForPercentage = (pct) => {
        var rgbScheme = [
          { pct: 0.0, color: { r: 255, g: 5, b: 0 } },
          { pct: 0.5, color: { r: 255, g: 255, b: 0 } },
          { pct: 1.0, color: { r: 5, g: 255, b: 0 } }
        ];
        let i = 1
        while (i < rgbScheme.length - 1) {
          if (pct < rgbScheme[i].pct) {
            break;
          }
          i++;
        }
        const lower = rgbScheme[i - 1];
        const upper = rgbScheme[i];
        const range = upper.pct - lower.pct;
        const rangePct = (pct - lower.pct) / range;
        const pctLower = 1 - rangePct;
        const pctUpper = rangePct;
        const color = {
          r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
          g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
          b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
        };
        return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
        // or output as hex if preferred
      };

      const finalScore = getScore();
      if (typeof finalScore !== 'string') {
        if (Math.round(finalScore) > 1) {
          // if the score rounded is below 1, let the background be black
          e.target.style.backgroundColor = getColorForPercentage((finalScore - 2) / (8 - 2));
          e.target.style.color = 'black';
        }
      }

      e.target.innerHTML = finalScore;
    }
  });


})();


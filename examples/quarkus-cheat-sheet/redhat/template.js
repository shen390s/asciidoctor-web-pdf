const { layer: faLayer, icon: faIcon, dom: faDom, library: faLibrary } = require('@fortawesome/fontawesome-svg-core')
const { faCircle, faInfoCircle, faExclamationCircle, faQuestionCircle, faExclamationTriangle, faHandPaper, fas } = require('@fortawesome/free-solid-svg-icons')
const { faLightbulb, far } = require('@fortawesome/free-regular-svg-icons')
const { fab } = require('@fortawesome/free-brands-svg-icons')
faLibrary.add(fas, far, fab)

const faDefaultIcon = faIcon(faQuestionCircle)
const faImportantIcon = faIcon(faExclamationCircle)
const faNoteIcon = faIcon(faInfoCircle)
const faWarningIcon = faIcon(faExclamationTriangle)
const faCautionIcon = faLayer((push) => {
  push(faIcon(faCircle))
  push(faIcon(faHandPaper, {transform: { size: 10, x: -0.5 }}))

})
const faTipIcon = faLayer((push) => {
  push(faIcon(faCircle))
  push(faIcon(faLightbulb, {transform: { size: 10 }}))
})

const isSvgIconEnabled = (node) => node.getDocument().isAttribute('icontype', 'svg') || node.getDocument().isAttribute('icons', 'font')

const fontAwesomeStyleContent = (node) => {
  if (isSvgIconEnabled(node)) {
    return faDom.css()
  }
  return ''
}

const assetUriScheme = (node) => {
  let result = node.getAttribute('asset-uri-scheme', 'https')
  if (result.trim() !== '') {
    result = `${result}:`
  }
  return result
}

const syntaxHighlighterHead = (node, syntaxHighlighter, attrs) => {
  if (syntaxHighlighter !== Opal.nil && syntaxHighlighter['$docinfo?']('head')) {
    return syntaxHighlighter['$docinfo']('head', node, Opal.hash(attrs))
  }
  return ''
}

const syntaxHighlighterFooter = (node, syntaxHighlighter, attrs) => {
  if (syntaxHighlighter !== Opal.nil && syntaxHighlighter['$docinfo?']('footer')) {
    return syntaxHighlighter['$docinfo']('footer', node, Opal.hash(attrs))
  }
  return ''
}

const getAuthors = function (node) {
  const result = [];
  const authorCount = node.getAttribute('authorcount')
  if (authorCount > 1) {
    for (let index = 1; index < authorCount + 1; index++) {
      const author = node.getAttribute(`author_${index}`)
      const email = node.getAttribute(`email_${index}`)
      const bio = node.getAttribute(`authorbio_${index}`)
      let twitter;
      if (email && email.startsWith("https://twitter.com/")) {
        twitter = email.replace("https://twitter.com/", "");
      }
      result.push({ name: author, email: email, bio: bio, twitter: twitter })
    }
  } else {
    const author = node.getAttribute('author')
    const email = node.getAttribute('email')
    const bio = node.getAttribute(`authorbio`)
    let twitter;
    if (email && email.startsWith("https://twitter.com/")) {
      twitter = email.replace("https://twitter.com/", "");
    }
    result.push({ name: author, email: email, bio: bio, twitter: twitter })
  }
  return result;
}

const renderAuthors = function (authors) {
  return authors.map(author => {
    return `<div class="author">
<div class="author-avatar"><img src="http://avatars.io/twitter/${author.twitter}"/></div>
<div class="author-name"><a href="${author.email}">@${author.twitter}</a></div>
<div class="author-bio">${author.bio}</div>
</div>
`;
  }).join('\n')
}

module.exports = {
    paragraph: (node) => `<p class="${node.getRoles().join(' ')}">${node.getContent()}</p>`,
    document: (node) => {
      const cdnBaseUrl = `${assetUriScheme(node)}//cdnjs.cloudflare.com/ajax/libs`
      const linkcss = node.isAttribute('linkcss')
      const syntaxHighlighter = node['$syntax_highlighter']()
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
${fontAwesomeStyleContent(node)}
</style>
${syntaxHighlighterHead(node, syntaxHighlighter, { linkcss: linkcss })}
<link href="./redhat/assets/style.css" rel="stylesheet">
</head>
<body>
<header>
  <h1>${node.getHeader().getTitle()}</h1>
  <img class="logo" src="./redhat/assets/${node.getAttribute('logo')}"/>
</header>
<section class="content">
${node.getContent()}
<div class="sect1 authors">
<h3>Authors :</h3>
${renderAuthors(getAuthors(node))}
<div class="author-bio">${node.getAttribute('version')}</div>
<img src="./redhat/assets/by-nc-sa.png"/>
</div>

</section>
${syntaxHighlighterFooter(node, syntaxHighlighter, { cdn_base_url: cdnBaseUrl, linkcss: linkcss, self_closing_tag_slash: '/' })}
</body>`
  },
  page_break: () => `<div class="page-break"></div>`,
  admonition: (node) => {
    const idAttribute = node.getId() ? ` id="${node.getId()}"` : ''
    const name = node.getAttribute('name')
    const titleElement = node.getTitle() ? `<div class="title">${node.getTitle()}</div>\n` : ''
    let icon
    if (name === 'note') {
      icon = faNoteIcon
    } else if (name === 'important') {
      icon = faImportantIcon
    } else if (name === 'caution') {
      icon = faCautionIcon
    } else if (name === 'tip') {
      icon = faTipIcon
    } else if (name === 'warning') {
      icon = faWarningIcon
    } else {
      icon = faDefaultIcon
    }
    return `<div${idAttribute} class="admonitionblock ${name}${node.getRole() ? node.getRole() : ''}">
<table>
<tr>
<td class="icon icon-${name}">
${icon.html}
</td>
<td class="content">
${titleElement}${node.getContent()}
</td>
</tr>
</table>
</div>`
  }
}

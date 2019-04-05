const protocol = process.env.PROTOCOL || 'http'
const domain = process.env.DOMAIN || 'localhost'


module.exports = {
    siteMetadata:{
        title: 'Stylo',
        siteUrl: `${protocol}://${domain}`,
        description: 'Stylo, online text editor for scholars',
        image: '/favicon.ico'
    },
    plugins:[`gatsby-plugin-sass`,`gatsby-plugin-react-helmet`]
}
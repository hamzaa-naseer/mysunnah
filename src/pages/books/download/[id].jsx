"use client"
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
const BookDownload = dynamic(() => import('src/components/Books/BookDownload'), { ssr: false })

const BookDownloadPage = () => {
    return (
        <Layout>
            <BookDownload />
        </Layout>
    )
}

export default BookDownloadPage

"use client"
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
const BookDetails = dynamic(() => import('src/components/Books/BookDetails'), { ssr: false })

const BookDetailsPage = () => {
    return (
        <Layout>
            <BookDetails />
        </Layout>
    )
}

export default BookDetailsPage

"use client"
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../components/Layout/Layout'), { ssr: false })
const BookShop = dynamic(() => import('../../components/Books/BookShop'), { ssr: false })

const Books = () => {
    return (
        <Layout>
            <BookShop />
        </Layout>
    )
}

export default Books

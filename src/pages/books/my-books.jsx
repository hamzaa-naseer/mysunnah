"use client"
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
const MyBooks = dynamic(() => import('src/components/Books/MyBooks'), { ssr: false })

const MyBooksPage = () => {
    return (
        <Layout>
            <MyBooks />
        </Layout>
    )
}

export default MyBooksPage

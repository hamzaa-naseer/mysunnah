import dynamic from 'next/dynamic'
import Layout from 'src/components/Layout/Layout'
const HomeComp = dynamic(() => import('src/components/Static-Pages/HomeComp'), { ssr: false })

const Home = () => {
  return (
    <Layout>
      <HomeComp />
    </Layout>
  )
}

export default Home

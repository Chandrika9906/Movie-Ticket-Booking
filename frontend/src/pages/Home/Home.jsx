import React from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Banner from '../../components/Banner/Banner'
import Movies from '../../components/Movies/Movies'
import Trailers from '../../components/Trailers/Trailers'
import News from '../../components/News/News'
import Footer from '../../components/Footer/Footer'

const Home = () => {
  return (
    <div>
      <Navbar/>
      <Banner/>
      <Movies/>
      <Trailers/>
      <News/>
      <Footer/>
    </div>
  )
}

export default Home

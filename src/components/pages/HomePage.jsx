import React from 'react'
import GetProductVarientDetail from '../AxiosRequest/ProductVarientDetails'
import Hero from '../ReusableUI/HeroImage'
import Footer from '../ReusableUI/Footer'



export default function Homepage() {


  return (
    <>
    <Hero />
    <div className="Mainbody" >
    <GetProductVarientDetail />
    <br/>
    <br/>
    </div>

    </>
  )
}

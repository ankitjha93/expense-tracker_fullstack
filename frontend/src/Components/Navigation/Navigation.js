import React from 'react'
import styled from 'styled-components'
import avatar from '../../img/avatar.png'

function Navigation() {
  return (
    <NavStyled>

         <div className='user-con'>
           <img src={avatar} alt=''/>
           <div className='text'>
              <h2>Ankit</h2>
              <p>Your Money</p>
           </div>
         </div>

         <ul className='menu-items'>
             
         </ul>

    </NavStyled>
  )
}

const NavStyled = styled.nav`
     
`

export default Navigation
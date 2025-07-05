"use client";
import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Link from 'next/link';


export default function Home() {

  return (
    <>
    <Box   sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& button': { m: 1 }
      }}
      >
  <div>
      <Link href={"/signup"}>
    <Button variant="contained" size="medium">
      SignUp
    </Button>
      </Link>

       <Link href={"/signup"}>
    <Button variant="contained" size="medium">
      SignUp
    </Button>
      </Link>
  </div>
</Box>
        
    </>
  )
}




import { useAppContext } from '../context/AppContext'
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const Loading = () => {

    const {navigate} = useAppContext();
    let {search} = useLocation()
    const query = new URLSearchParams(search)
    const nextUrl = query.get('next')

    useEffect(()=>{
        if(nextUrl){
            setTimeout(()=>{
                navigate(`/${nextUrl}`)
            },3000)
        }
    },[nextUrl])

  return (
    <div className='flex flex-col items-center justify-center h-screen space-y-4'>
        <div className='animate-spin rounded-full h-20 w-20 border-4 border-gray-300 border-t-primary'></div>
    </div>
  )
}
 
export default Loading

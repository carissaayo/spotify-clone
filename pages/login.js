import {getProviders,signIn} from "next-auth/react"
const Login = ({providers}) => {
  
  return (
    <div 
    className="flex flex-col items-center bg-black min-h-screen justify-center"
    >
       
        <img src='https://links.papareact.com/9xl' alt='spotify logo' className="w-52 mb-5"
        />

        {Object.values(providers).map(provider=>(
          <div key={provider.name}>
            <button
              onClick={() => signIn(provider.id, { callbackUrl: "/" })}
               className="bg-[#18b66e] text-white p-5 rounded-full "
            >
             Login with {provider.name}
            </button>
          </div>
        ))}
    </div>
  )
}

export default Login;
export const getServerSideProps = async ()=>{
  const providers = await getProviders();

  return{
    props:{
      providers,
    }
  }
}

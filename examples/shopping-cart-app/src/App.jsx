import {CardsContainer} from './components/CardsContainer';
import {Cart} from './components/Cart';
import {OrderConfirmed} from './components/OrderConfirmed';
import {useCartStore} from './store/cart.store';
import  PowerProvider from './PowerProvider';


function App() {
  const { cartItems } = useCartStore();

  return(
    <PowerProvider>
      <main className='flex justify-center'>
        <section className='w-[327px] md:w-[675px] xl:w-[1180px] mb-24'>
          <OrderConfirmed cartItems={cartItems}/>
          <h1 className='text-[2.5rem] font-bold mt-8 mb-[30px]'>Desserts</h1>
          <div className='flex flex-col gap-10 xl:flex-row'>
            <CardsContainer/>
            <Cart />
          </div>
        </section>
      </main>
    </PowerProvider>
  )
}

export default App

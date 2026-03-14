import {ProductCard} from './ProductCard';
//import data from '../../data.json';
import {Siero_productsService} from '../generated/services/Siero_productsService'
import {useEffect, useState} from 'react';


export const CardsContainer = () => {

  const [products, setProducts] = useState([]);

  useEffect(() => {
    
    async function fetchProducts() {
      try {
        const result = await Siero_productsService.getAll();
        if (result.data) {
              const products = result.data;
              console.log(`Retrieved ${products.length} products`);
              setProducts(products);
        }
      } catch (err) {
        console.error('Failed to retrieve products:', err);
      }
    }

    fetchProducts();
  },[])

      return (
        <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-6'>
          {
            products.map(item => <ProductCard key={item.siero_name} {...item} />)
          }
        </div>
      )
}

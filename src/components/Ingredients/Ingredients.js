import React, { useState, useEffect, useCallback, useReducer } from 'react';
import IngredientForm from './IngredientForm';
import Search from './Search';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';

const ingredientReducer = (currentIngredients, action) => {

    switch (action.type) {
        case 'SET':
            return action.ingredients
        case 'ADD':
            return [
                ...currentIngredients, action.ingredient
            ]
        case 'DELETE':
            return currentIngredients.filter(ing => ing.id !== action.id);
        default:
            throw new Error('Should not reach here')

    }
}
const httpReducer = (initHttpSate, action) => {
    switch (action.type) {
        case 'SEND':
            return { loading: true }
        case 'RESPONSE':
            return { ...initHttpSate, loading: false }
        case 'ERROR':
            return { loading: false, error: action.errorMessage }
        case 'CLEARERROR':
            return {  error: null }
        default:
            throw new Error('Should not reach here');
    }
}

const Ingredients = () => {
    const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
    const [initHttpSate, dispatchHttp] = useReducer(httpReducer, { loading: false, error: null });

    useEffect(() => {
        fetch('https://react-hooks-58940.firebaseio.com/ingredient.json').then(
            response => {

                return response.json();
            }
        ).then(responseData => {
            const loadedIngredients = [];

            for (var key in responseData) {
                loadedIngredients.push(
                    {
                        id: key,
                        title: responseData[key].title,
                        amount: responseData[key].amount
                    }
                )
            }

            //setUserIngredients(loadedIngredients)
        })
    }, [])

    useEffect(() => {
        console.log('rendering cycle')
    })
    const addIngredientHandler = ingredient => {
        dispatchHttp({ type: 'SEND' });
        fetch('https://react-hooks-58940.firebaseio.com/ingredient.json', {
            method: 'POST',
            body: JSON.stringify(ingredient),
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            dispatchHttp({ type: 'RESPONSE' });
            return response.json();
        }).then(responseData => {
            dispatch({ type: 'ADD', ingredient: { id: responseData.name, ...ingredient } })
        });

    }
    const filteredIngredientHandler = useCallback(filteredIngredients => {
        dispatch({ type: 'SET', ingredients: filteredIngredients })

    }, []);

    const onRemoveIngredientHandler = (ingredientId) => {
        dispatchHttp({ type: 'SEND' });
        fetch(`https://react-hooks-58940.firebaseio.com/ingredient/${ingredientId}.json/`, {
            method: 'DELETE'
        })
            .then(response => {
                dispatchHttp({ type: 'RESPONSE' });
                dispatch({ type: 'DELETE', id: ingredientId })

            }).catch(error => {
                dispatchHttp({ type: 'ERROR', errorMessage: error });
            })
    }
    const clearError = () => {
        dispatchHttp({type:'CLEARERROR'});
    }
    return (
        <div className="App">
            {initHttpSate.error && <ErrorModal onClose={clearError} />}
            <IngredientForm onAddIngredient={addIngredientHandler}
                ingredients={userIngredients}
                loading={initHttpSate.loading}
            />

            <section>
                <Search onLoadIngredients={filteredIngredientHandler} />
                <IngredientList ingredients={userIngredients} onRemoveItem={onRemoveIngredientHandler} />
            </section>
        </div>
    );
}

export default Ingredients;

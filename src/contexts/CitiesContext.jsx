import {
  useState,
  useEffect,
  createContext,
  useContext,
  useReducer,
} from "react";

const CitiesContext = createContext(CitiesProvider);
const BASE_URL = "http://localhost:8000/cities";

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};
function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "cities/loaded":
      return { ...state, isLoading: false, cities: action.payload };
    case "city/loaded":
      return { ...state, isLoading: false, currentyCity: action.payload };
    case "cities/created":
      return { ...state, isLoading: false, cities: [...state.cities, action.payload] };
    case "cities/deleted":
      return { ...state, isLoading: false, cities: state.cities.filter((city) => city.id !== action.payload) };
    case "rejected":
      return { ...state, isLoading: false, error: action.payload };
    default:
      throw new Error("Unknown Action.");
  }
}
function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(() => {
    const fetchCities = async () => {
      dispatch({ type: "loading" });
      try {
        const res = await fetch(BASE_URL);
        const data = await res.json();
        dispatch({ type: "cities/loaded", payload: data });
      } catch {
        dispatch({
          type: "rejected",
          payload: "There was an error in fetching the cities.",
        });
      }
    };
    fetchCities();
  }, []);

  async function getCity(id) {
    dispatch({ type: "loading" });
    try {
      const res = await fetch(`${BASE_URL}/${id}`);
      const data = await res.json();
      dispatch({ type: "city/loaded", payload: data });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error in fetching the city.",
      });
    }
  }

  async function createCity(newCity) {
    dispatch({ type: "loading" });
    try {
      const res = await fetch(`${BASE_URL}`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      dispatch({
        type: "cities/created",
        payload: data,
      });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error in adding the cities.",
      });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });

    try {
      await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
      });
      dispatch({
        type: "cities/deleted",
        payload: id,
      });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error in deleting the cities.",
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        deleteCity,
      }}>
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("Context is used outside the scope.");
  return context;
}

export { CitiesProvider, CitiesContext, useCities };

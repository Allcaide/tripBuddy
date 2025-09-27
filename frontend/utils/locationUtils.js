// Função para extrair cidade e país do address (sem APIs externas)
export const parseLocationFromAddress = (address) => {
  if (!address || typeof address !== "string") {
    return {
      city: "Unknown City",
      country: "Unknown Country",
      fullLocation: "Unknown Location",
    };
  }

  // Split por vírgulas e remove espaços
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part);

  if (parts.length >= 2) {
    // Último elemento = País (USA, Portugal, etc.)
    const country = parts[parts.length - 1];

    // Para endereços como "560 Jefferson St, Napa, CA 94559, USA"
    // Queremos o "Napa" (antepenúltimo, ignorando código postal)
    let city;

    if (parts.length >= 4) {
      // Se temos 4+ partes, a cidade geralmente é a antepenúltima
      // [rua, cidade, estado/código, país]
      city = parts[parts.length - 3];
    } else if (parts.length === 3) {
      // Se temos 3 partes: [rua, cidade, país]
      city = parts[parts.length - 2];
    } else {
      // Se só temos 2 partes: [cidade, país]
      city = parts[parts.length - 2];
    }

    const result = {
      city,
      country,
      fullLocation: `${city}, ${country}`,
    };

    return result;
  }

  // Se não conseguimos fazer parsing
  console.log(`❌ Não foi possível fazer parsing de: "${address}"`);
  return {
    city: "Unknown City",
    country: "Unknown Country",
    fullLocation: "Unknown Location",
  };
};

// Cache simples para addresses já processados
const addressCache = new Map();

export const parseLocationFromAddressWithCache = (address) => {
  if (!address) return parseLocationFromAddress(address);

  if (addressCache.has(address)) {
    return addressCache.get(address);
  }

  const location = parseLocationFromAddress(address);
  addressCache.set(address, location);

  return location;
};

// Função para limpar cache
export const clearAddressCache = () => {
  addressCache.clear();
  console.log("🧹 Cache de addresses limpo");
};

// Manter as funções antigas comentadas para referência se precisarmos
/*
// Função principal para converter coordenadas - SÓ CIDADE E PAÍS
export const getCityCountryFromCoordinates = async (latitude, longitude) => {
  // ... código antigo comentado
};

export const getCityCountryFromCoordinatesWithCache = async (
  latitude,
  longitude,
) => {
  // ... código antigo comentado  
};
*/

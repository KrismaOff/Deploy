export const data = [
  {
    name: "Финансовый аналитик",
    mainSkills: ["Excel", "SQL", "VBA", "1С"],
    otherSkills: ["Power BI", "Python"],
  },
  {
    name: "Предприниматель",
    mainSkills: ["1C", "Excel", "Power BI"],
    otherSkills: [
      "Google Analytics",
      "Яндекс.Метрика",
      "Python",
      "SQL",
      "Tilda",
    ],
  },
  {
    name: "Продуктовый дизайнер",
    mainSkills: [
      "Figma",
      "Sketch",
      "Illustrator",
      "Photoshop",
      "Principle",
      "Tilda",
    ],
    otherSkills: ["Shopify", "Protopie", "Cinema 4D"],
  },
  {
    name: "Менеджер проекта",
    mainSkills: [
      "Visio",
      "1C",
      "Google Analytics",
      "Яндекс.Метрика",
      "Python",
      "SQL",
      "Tilda",
    ],
    otherSkills: ["Figma", "Sketch", "Shopify"],
  },
  {
    name: "Финансовый менеджер",
    mainSkills: ["1C", "Excel", "Power BI"],
    otherSkills: ["BPMN"],
  },
  {
    name: "Руководитель финансового департамента компании",
    mainSkills: ["Sketch", "Figma"],
    otherSkills: ["Shopify", "HQL"],
  },

  {
    name: "Продуктовый аналитик",
    mainSkills: [
      "Google Analytics",
      "Яндекс.Метрика",
      "SQL",
      "Power BI",
      "Python",
      "Excel",
    ],
    otherSkills: ["HQL", "Tableau", "R", "Machine learning"],
  },

  {
    name: "Руководитель финансового продукта",
    mainSkills: ["Visio"],
    otherSkills: ["Python"],
  },
  {
    name: "Менеджер по маркетингу",
    mainSkills: [
      "Google Analytics",
      "Яндекс.Метрика",
      "Google Ads",
      "Ahrefs",
      "Главред",
      "My Target",
    ],
    otherSkills: ["Tilda", "Photoshop", "Xenu", "Python"],
  },

  {
    name: "Менеджер по цифровой трансформации",
    mainSkills: [
      "Visio",
      "Google Analytics",
      "Яндекс.Метрика",
      "Python",
      "SQL",
      "Tilda",
    ],
    otherSkills: ["Figma", "Sketch", "Shopify"],
  },
]

export function getCache(maxSize) {
  let cache = []
  let userModifiedItems = new Map()

  return {
      setCacheChunk(value) {
          const items = Array.isArray(value) ? value : [value]
          items.forEach(item => {
              if (userModifiedItems.has(item.id)) userModifiedItems.set(item.id, item)
              else {
                  const existingIndex = cache.findIndex(cachedItem => cachedItem.id === item.id)
                  if (existingIndex > -1) cache.splice(existingIndex, 1);
                  cache.push(item)
              }
          });

          while (cache.length > maxSize) {
              cache.shift()
          }
      },

      changeItem(newData) {
          const items = Array.isArray(newData) ? newData : [newData]
          items.forEach(item => {
              userModifiedItems.set(item.id, item);
              const index = cache.findIndex(cachedItem => cachedItem.id === item.id)
              if (index > -1) cache.splice(index, 1)
          });
      },

      getCacheItemById(id) {
          if (userModifiedItems.has(id)) {
              return userModifiedItems.get(id)
          }

          const index = cache.findIndex(item => item.id === id)
          if (index > -1) {
              const [item] = cache.splice(index, 1)
              cache.push(item);
              return item
          }
          return null
      },

      getData() {
          return [...cache, ...userModifiedItems.values()]
      },

      getAppCache() {
          return [...cache]
      }
  };
};
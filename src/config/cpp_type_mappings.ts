export const cppTypeMappings = {
  "int": {
    "python": "int",
    "javascript": "number",
    "java": "int",
    "c": "int"
  },
  "long": {
    "python": "int",
    "javascript": "number",
    "java": "long",
    "c": "long"
  },
  "long long": {
    "python": "int",
    "javascript": "bigint",
    "java": "long",
    "c": "long long"
  },
  "unsigned int": {
    "python": "int",
    "javascript": "number",
    "java": "int", // Java doesn't have unsigned primitives
    "c": "unsigned int"
  },
  "float": {
    "python": "float",
    "javascript": "number",
    "java": "float",
    "c": "float"
  },
  "double": {
    "python": "float",
    "javascript": "number",
    "java": "double",
    "c": "double"
  },
  "long double": {
    "python": "float",
    "javascript": "number",
    "java": "double", 
    "c": "long double"
  },
  "char": {
    "python": "str",
    "javascript": "string",
    "java": "char",
    "c": "char"
  },
  "bool": {
    "python": "bool",
    "javascript": "boolean",
    "java": "boolean",
    "c": "bool" 
  },
  "std::string": {
    "python": "str",
    "javascript": "string",
    "java": "String",
    "c": "char*"
  },
  "std::vector<int>": {
    "python": "list[int]",
    "javascript": "number[]",
    "java": "List<Integer>", 
    "c": "int*"
  },
  "std::vector<double>": {
    "python": "list[float]",
    "javascript": "number[]",
    "java": "List<Double>",
    "c": "double*"
  },
  "std::vector<std::string>": {
    "python": "list[str]",
    "javascript": "string[]",
    "java": "List<String>",
    "c": "char**"
  },
  "std::map<std::string,int>": {
    "python": "dict[str, int]",
    "javascript": "Record<string, number>", 
    "java": "Map<String, Integer>",
    "c": "struct" 
  },
  "std::map<std::string,double>": {
    "python": "dict[str, float]",
    "javascript": "Record<string, number>",
    "java": "Map<String, Double>",
    "c": "struct"
  },
  "std::pair<int,int>": {
    "python": "tuple[int, int]",
    "javascript": "[number, number]",
    "java": "Pair<Integer, Integer>", 
    "c": "struct { int first; int second; }"
  }
};

export const cppTypeEnum = {
    "int": "int",
    "long": "long",
    "long long": "long long",
    "unsigned int": "unsigned int",
    "float": "float",
    "double": "double",
    "long double": "long double",
    "char": "char",
    "bool": "bool",
    "std::string": "std::string",
    "std::vector<int>": "std::vector<int>",
    "std::vector<double>": "std::vector<double>",
    "std::vector<std::string>": "std::vector<std::string>",
    "std::map<std::string,int>": "std::map<std::string,int>",
    "std::map<std::string,double>": "std::map<std::string,double>",
    "std::pair<int,int>": "std::pair<int,int>"
}
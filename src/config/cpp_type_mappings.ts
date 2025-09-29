export const cppTypeMappings = {
  "int": {
    "gcc": "int",
    "cpp": "int",
    "py": "int",
    "js": "number",
    "java": "int"
  },
  "long": {
    "gcc": "long",
    "cpp": "long",
    "py": "int",
    "js": "number",
    "java": "long"
  },
  "long long": {
    "gcc": "long long",
    "cpp": "long long",
    "py": "int",
    "js": "bigint",
    "java": "long"
  },
  "unsigned int": {
    "gcc": "unsigned int",
    "cpp": "unsigned int",
    "py": "int",
    "js": "number",
    "java": "int", // Java doesn't have unsigned primitives
  },
  "float": {
    "gcc": "float",
    "cpp": "float",
    "py": "float",
    "js": "number",
    "java": "float"
  },
  "double": {
    "gcc": "double",
    "cpp": "double",
    "py": "float",
    "js": "number",
    "java": "double"
  },
  "long double": {
    "gcc": "long double",
    "cpp": "long double",
    "py": "float",
    "js": "number",
    "java": "double", 
  },
  "char": {
    "gcc": "char",
    "cpp": "char",
    "py": "str",
    "js": "string",
    "java": "char"
  },
  "bool": {
    "gcc": "bool",
    "cpp": "bool",
    "py": "bool",
    "js": "boolean",
    "java": "boolean"
  },
  "std::string": {
    "gcc": "char*",
    "cpp": "std::string",
    "py": "str",
    "js": "string",
    "java": "String"
  },
  "std::vector<int>": {
    "gcc": "int*",
    "cpp": "std::vector<int>",
    "py": "list[int]",
    "js": "number[]",
    "java": "List<Integer>", 
  },
  "std::vector<double>": {
    "gcc": "double*",
    "cpp": "std::vector<double>",
    "py": "list[float]",
    "js": "number[]",
    "java": "List<Double>",
  },
  "std::vector<std::string>": {
    "gcc": "char**",
    "cpp": "std::vector<std::string>",
    "py": "list[str]",
    "js": "string[]",
    "java": "List<String>",
  },
  "std::map<std::string,int>": {
    "gcc": "struct", 
    "cpp": "std::map<std::string,int>",
    "py": "dict[str, int]",
    "js": "Record<string, number>", 
    "java": "Map<String, Integer>",
  },
  "std::map<std::string,double>": {
    "gcc": "struct",
    "cpp": "std::map<std::string,double>",
    "py": "dict[str, float]",
    "js": "Record<string, number>",
    "java": "Map<String, Double>",
  },
  "std::pair<int,int>": {
    "gcc": "struct { int first; int second; }",
    "cpp": "std::pair<int,int>",
    "py": "tuple[int, int]",
    "js": "[number, number]",
    "java": "Pair<Integer, Integer>", 
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
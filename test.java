import org.json.JSONArray;
import org.json.JSONObject;

public class Main {
    public static void main(String[] args) {
        // Create main JSON object
        JSONObject problem = new JSONObject();
        problem.put("title", "Two Sum");
        problem.put("description", "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.");
        problem.put("difficulty", "easy");
        problem.put("function_name", "twoSum");

        // Add parameters
        JSONArray parameters = new JSONArray();

        JSONObject p1 = new JSONObject();
        p1.put("name", "nums");
        p1.put("type", "List<Integer>");
        parameters.put(p1);

        JSONObject p2 = new JSONObject();
        p2.put("name", "target");
        p2.put("type", "int");
        parameters.put(p2);

        problem.put("parameters", parameters);

        // Print pretty JSON
        System.out.println(problem.toString(4));

        // Access values
        String func = problem.getString("function_name");
        System.out.println("Function: " + func);
    }
}

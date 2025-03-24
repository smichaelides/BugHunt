--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: problems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.problems (
    problemid integer NOT NULL,
    level integer NOT NULL,
    difficulty character varying(50),
    description text,
    code text,
    correctsolution text,
    wrongoption1 text,
    wrongoption2 text,
    wrongoption3 text
);


--
-- Name: problems_problemid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.problems_problemid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: problems_problemid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.problems_problemid_seq OWNED BY public.problems.problemid;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    userid integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    streakcounter integer DEFAULT 0,
    points integer DEFAULT 0,
    challengescompleted integer DEFAULT 0,
    last_activity_date date
);


--
-- Name: users_userid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_userid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_userid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_userid_seq OWNED BY public.users.userid;


--
-- Name: problems problemid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problems ALTER COLUMN problemid SET DEFAULT nextval('public.problems_problemid_seq'::regclass);


--
-- Name: users userid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN userid SET DEFAULT nextval('public.users_userid_seq'::regclass);


--
-- Data for Name: problems; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.problems (problemid, level, difficulty, description, code, correctsolution, wrongoption1, wrongoption2, wrongoption3) FROM stdin;
1	1	Easy	A simple Java code is intended to print the sum of an array [1, 2, 3, 4, 5]. However, it is printing zero instead of the correct sum, which is 15.	public class Main {\n    public static void main(String[] args) {\n        int[] numbers = {1, 2, 3, 4, 5};\n        int sum = 0;\n        for (int n : numbers) {\n            sum = n;\n        }\n        System.out.println(sum);\n    }\n}	public class Main {\n    public static void main(String[] args) {\n        int[] numbers = {1, 2, 3, 4, 5};\n        int sum = 0;\n        for (int n : numbers) {\n            sum += n;\n        }\n        System.out.println(sum);\n    }\n}	The problem is with the System.out.println statement. It should be System.out.print.	The array declaration is incorrect. It should be int numbers[] = {1, 2, 3, 4, 5};	The sum variable should be declared as double instead of int.
2	1	Easy	A main method is trying to output the string "Hello World!" but it's causing a compile time error.	public class Main {\n  public static void main(String[] args) {\n    string text = "Hello World!";\n    System.out.println(text);\n  }\n}	public class Main {\n  public static void main(String[] args) {\n    String text = "Hello World!";\n    System.out.println(text);\n  }\n}	Replace String with int in the declaration	Add a semicolon at the end of the print statement	Remove the quotation marks around "Hello World!"
3	1	Medium	You are given a Java code that should calculate the factorial of a number. The program compiles successfully but it is not giving the correct output when executed. Identify and fix the error in the code.	public class Main {\n\n    public static void main(String[] args) {\n        System.out.println(factorial(5));\n    }\n\n    public static int factorial(int n) {\n        int result = n;\n        while(n > 1) {\n            result *= --n;\n        }\n        return result;\n    }\n}	public class Main {\n\n    public static void main(String[] args) {\n        System.out.println(factorial(5));\n    }\n\n    public static int factorial(int n) {\n        int result = 1;\n        for (int i = 1; i <= n; i++) {\n            result *= i;\n        }\n        return result;\n    }\n}	The problem is in how the function is being called. It should be called with 'n--' instead of '5' in the main method.	The initial value of the 'result' variable should be 0, not 'n'.	The while loop condition should be 'n >= 1' not 'n > 1'.
4	1	Hard	In a threaded application, a race condition is causing unpredictable and incorrect results. The program tries to increment a counter value by two threads concurrently.	public class Counter {\n    private int count = 0;\n\n    public void increment() {\n        count++;\n    }\n\n    public int getCount() {\n        return count;\n    }\n}\n\n// in main thread\nCounter counter = new Counter();\n\nThread t1 = new Thread(() -> {\n    for(int i = 0; i < 10000; i++) {\n        counter.increment();\n    }\n});\n\nThread t2 = new Thread(() -> {\n    for(int i = 0; i < 10000; i++) {\n        counter.increment();\n    }\n});\n\nt1.start();\nt2.start();\n\nt1.join();\nt2.join();\n\nSystem.out.println(counter.getCount());	public class Counter {\n    private int count = 0;\n\n    public synchronized void increment() {\n        count++;\n    }\n\n    public int getCount() {\n        return count;\n    }\n}\n\n// in main thread\nCounter counter = new Counter();\n\nThread t1 = new Thread(() -> {\n    for(int i = 0; i < 10000; i++) {\n        counter.increment();\n    }\n});\n\nThread t2 = new Thread(() -> {\n    for(int i = 0; i < 10000; i++) {\n        counter.increment();\n    }\n});\n\nt1.start();\nt2.start();\n\nt1.join();\nt2.join();\n\nSystem.out.println(counter.getCount());	Changing the threads to start at different times can fix the issue because it will prevent the race condition.	Instead of using a single instance of 'Counter', use separate instances for each Thread, this will stop them from interfering with each other.	Using a different primitive like long or short for the count variable will change its atomic properties and will fix the race condition.
5	1	Hard	You are tasked with creating a Java console program that receives user input for length, width, and height (all integers) of a box, and calculates its volume. However, the current implementation is throwing an InputMismatchException error.	import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n\n        System.out.println("Enter length: ");\n        int length = (int) scanner.nextDouble();\n\n        System.out.println("Enter width: ");\n        int width = (int) scanner.nextDouble();\n        \n        System.out.println("Enter height: ");\n        int height = (int) scanner.nextDouble();\n        \n        int volume = length * width * height;\n        System.out.println("Volume of the box: " + volume);\n        scanner.close();\n    }\n}	import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n\n        System.out.println("Enter length: ");\n        int length = scanner.nextInt();\n\n        System.out.println("Enter width: ");\n        int width = scanner.nextInt();\n        \n        System.out.println("Enter height: ");\n        int height = scanner.nextInt();\n        \n        int volume = length * width * height;\n        System.out.println("Volume of the box: " + volume);\n        scanner.close();\n    }\n}	Switch the order of the input collection, asking for the height first, then the width, and finally the length.	Change the datatype for length, width, and height to float.	Remove the explicit casting to int in scanner.nextDouble().
6	2	Easy	The Java code is intended to iterate over an array and print out each element. However, it currently throws an ArrayIndexOutOfBoundsException.	public class Main\n{\n    public static void main(String[] args) {\n        int[] nums = {1,2,3,4,5};\n        for(int i=0; i<=nums.length; i++){\n            System.out.println(nums[i]);\n        }\n    }\n}	public class Main\n{\n    public static void main(String[] args) {\n        int[] nums = {1,2,3,4,5};\n        for(int i=0; i<nums.length; i++){\n            System.out.println(nums[i]);\n        }\n    }\n}	Replace the "<=" operator in the for loop with ">".	Replace "nums.length" with "nums.length()".	Change the index "i" in "nums[i]" to a constant number like "nums[0]".
7	2	Easy	The provided Java code is supposed to print out the string "Welcome to my Java class" to the console. Unfortunately, it prints out nothing. Identify the issue and rectify it.	public class Main {\n  public static void main(String[] args) {\n        \n  }\n\n  public void printMessage() {\n    System.out.println("Welcome to my Java class");\n  }\n}	public class Main {\n  public static void main(String[] args) {\n    new Main().printMessage();\n  }\n\n  public void printMessage() {\n    System.out.println("Welcome to my Java class");\n  }\n}	Replace the printMessage method with System.out.print("Welcome to my Java class");	Change the printMessage method to a static method.	Add a return statement to the printMessage method.
16	4	Easy	A program is supposed to print the phrase "Hello World" 10 times, but it's caught in an infinite loop.	for(int i = 1; i <= 10; i--){\n    System.out.println("Hello World");\n}	for(int i = 1; i <= 10; i++){\n    System.out.println("Hello World");\n}	Replacing "Hello World" with 'Hello World'	Removing "=", so the condition is "i < 10"	Replacing "<=" with "!=".
8	2	Medium	A method named getUserName is intended to return the name of a User object. However, it is not returning expected results. Instead of the user name, it is constantly returning NULL.	public class User {\n    private String name;\n    \n    public User(String name) {\n        this.name = name;\n    }\n    \n    public String getUserName(){\n        String name;\n        return name;\n    }\n}	public class User {\n    private String name;\n    \n    public User(String name) {\n        this.name = name;\n    }\n    \n    public String getUserName(){\n        return this.name;\n    }\n}	The User constructor does not need the this keyword.	The getUserName() method should be "return name;" instead of "return this.name;".	The User constructor should only assign name without receiving an argument.
9	2	Hard	You have been tasked with creating a method that accepts a string of comma-separated numbers and returns a list of integers. However, the code throws NumberFormatException. The `stringToIntegerList` method should correctly convert the provided string to a list of integers.	import java.util.Arrays;\nimport java.util.List;\nimport java.util.stream.Collectors;\n\npublic class Main {\n    public static void main(String[] args) {\n        List<Integer> myList = stringToIntegerList("1,2,3,4,5");\n        System.out.println(myList);\n    }\n    public static List<Integer> stringToIntegerList(String str) {\n        return Arrays.stream(str.split(","))\n                .map(Integer::valueOf)\n                .collect(Collectors.toList());\n    }\n}	import java.util.Arrays;\nimport java.util.List;\nimport java.util.stream.Collectors;\n\npublic class Main {\n    public static void main(String[] args) {\n        List<Integer> myList = stringToIntegerList("1,2,3,4,5");\n        System.out.println(myList);\n    }\n    public static List<Integer> stringToIntegerList(String str) {\n        return Arrays.stream(str.split(","))\n                .map(String::trim)\n                .map(Integer::parseInt)\n                .collect(Collectors.toList());\n    }\n}	The problem is with the main method, it's not correctly printing the list.	The Arrays class does not provide the method `stream` so it is causing the error.	The list is not correctly instantiated and should be done in the main method.
10	2	Hard	The program receives two integers as inputs. If both inputs are positive, it should return their multiplication, if one of them is negative, it should return their subtraction, if both are negative it should return their addition. The bug lies in the calculation of the output.	public int calculate(int a, int b){\n    int output;\n    if(a > 0 && b > 0){\n        output = a + b;\n    }\n    else if(a < 0 || b < 0){\n        output = a * b;\n    }\n    else{\n        output = a - b;\n    }\n    return output;\n}	public int calculate(int a, int b){\n    int output;\n    if(a > 0 && b > 0){\n        output = a * b;\n    }\n    else if(a < 0 && b < 0){\n        output = a + b;\n    }\n    else{\n        output = a - b;\n    }\n    return output;\n}	The 'if' expression is checking if both values are smaller than zero, it should check if they are greater instead.	The 'else' block needs to add the numbers instead of subtracting them.	The issue is with the method’s return type, it should be long instead of int.
11	3	Easy	The code is supposed to print numbers 1 through 10 inclusive. However, it's only printing numbers 1 to 9 and is skipping the number 10.	public class Main {\n    public static void main(String[] args){\n        for(int i=1; i<10; i++) {\n            System.out.println(i);\n        }\n    }\n}	public class Main {\n    public static void main(String[] args){\n        for(int i=1; i<=10; i++) {\n            System.out.println(i);\n        }\n    }\n}	Replace `<` with `>`	Replace `10` with `9` in the for loop of the fixed code	Replace `println` with `print`
12	3	Easy	Your task is to write a function in Java that calculates the factorial of a given number. However, the code provided is not taking the base case into consideration thereby going into infinite recursion.	public class Main {\n    public static void main(String[] args) {\n        System.out.println(factorial(5));\n    }\n\n    public static int factorial(int n) {\n        return n * factorial(n - 1);\n    }\n}	public class Main {\n    public static void main(String[] args) {\n        System.out.println(factorial(5));\n    }\n\n    public static int factorial(int n) {\n        if (n == 0) return 1;\n        return n * factorial(n - 1);\n    }\n}	Replace the multiplication operator with addition in the return statement	Remove the recursion, and calculate the factorial in the main function	Add a condition that stops the recursion when n is less than 0
13	3	Medium	You are attempting to use a 'for each' loop to iterate through an ArrayList of integers and print each element. But when you run the code, it throws a "NullPointerException".	import java.util.ArrayList;\n\npublic class Main {\n    public static void main(String[] args) {\n        ArrayList<Integer> numbers = null;\n\n        for (Integer number : numbers) {\n            System.out.println(number);\n        }\n    }\n}	import java.util.ArrayList;\nimport java.util.Arrays;\n\npublic class Main {\n    public static void main(String[] args) {\n        ArrayList<Integer> numbers = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));\n\n        for (Integer number : numbers) {\n            System.out.println(number);\n        }\n    }\n}	Replace the for-each loop with a regular for loop.	Change the datatype of "numbers" from ArrayList<Integer> to List<Integer>.	Replace println with print in the System.out.println statement.
14	3	Hard	The provided Java code is supposed to multiply each element of an array by a given number. However, the method isn't returning the expected output. Some elements are zero when they shouldn't be.	public static int[] multiplyArray(int[] arr, int num) {\n    for(int i = 0; i < arr.length; i++) {\n        arr[i] *= num;\n    }\n    arr = null;\n    return arr;\n}	public static int[] multiplyArray(int[] arr, int num) {\n    for(int i = 0; i < arr.length; i++) {\n        arr[i] *= num;\n    }\n    return arr;\n}	The multiplication operation is incorrect, it should be arr[i] = arr[i] * num;	The method should return an array of length one with the value of num.	The issue is in the for loop, it should start from 1.
15	3	Hard	You're creating a program to find the maximum number in an array using a recursive function. However, the program always returns 0 no matter the input.	public class Main {\n    public static void main(String[] args) {\n        int[] array = {10, 20, 30, 40, 50};\n        System.out.println(findMax(array, 0));\n    }\n    \n    static int findMax(int[] array, int index) {\n        if (index == array.length) {\n            return 0;\n        } else {\n            int max = findMax(array, index + 1);\n            \n            if (array[index] > max) {\n                return array[index];\n            } else {\n                return max;\n            }\n        }\n    }\n}	public class Main {\n    public static void main(String[] args) {\n        int[] array = {10, 20, 30, 40, 50};\n        System.out.println(findMax(array, array.length - 1));\n    }\n    \n    static int findMax(int[] array, int index) {\n        if (index == 0) {\n            return array[0];\n        } else {\n            int max = findMax(array, index - 1);\n            \n            if (array[index] > max) {\n                return array[index];\n            } else {\n                return max;\n            }\n        }\n    }\n}	Changing the recursion base case to `if (index < 0)`	Initializing `max` to `array[index]` instead of calling the recursive function	Swapping the order of if-else conditions inside the recursive function
17	4	Easy	The program is intended to print "Hello, World!" but instead, it throws a compilation error.	public class HelloWorld {\n    public static void main(String[] args) \n        System.out.println("Hello, World!");\n    }\n}	public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}	Change "Hello, World!" to 'Hello, World!'	Remove the "public" before "class HelloWorld"	Replace "System" with "system"
18	4	Medium	The program is expected to return the factorial of a number. However, it currently returns the result as zero for all positive number inputs.	public class Main {\n    public static void main(String[] args) {\n        System.out.println(factorial(5));\n    }\n\n    public static int factorial(int n) {\n        int fact = 0;\n        for (int i = 1; i <= n; i++) {\n            fact *= i;\n        }\n        return fact;\n    }\n}	public class Main {\n    public static void main(String[] args) {\n        System.out.println(factorial(5));\n    }\n\n    public static int factorial(int n) {\n        int fact = 1;\n        for (int i = 1; i <= n; i++) {\n            fact *= i;\n        }\n        return fact;\n    }\n}	The for loop in the factorial method needs a condition where it stops when i is equal to the input number, not less than equal to.	The return type of the factorial method should be changed from int to long.	The factorial function should be implemented using recursion rather than a loop.
19	4	Hard	You have a program that is meant to calculate the minimum and maximum of an array, but the output is not as expected.	public class MinMax {\n    public static void main(String[] args) {\n        int[] arr = new int[]{1, 2, 3, 4, 5};\n        int min = arr[0], max = arr[0];\n\n        for (int i = 0; i < arr.length; i++) {\n            if (min > arr[i]) min = arr[i];\n            if (max > arr[i]) max = arr[i];\n        }\n        \n        System.out.println("Min: " + min + " Max: " + max);\n    }\n}	public class MinMax {\n    public static void main(String[] args) {\n        int[] arr = new int[]{1, 2, 3, 4, 5};\n        int min = arr[0], max = arr[0];\n\n        for (int i = 0; i < arr.length; i++) {\n            if (min > arr[i]) min = arr[i];\n            if (max < arr[i]) max = arr[i];\n        }\n        \n        System.out.println("Min: " + min + " Max: " + max);\n    }\n}	The array might be null or empty, causing an ArrayIndexOutOfBoundsException.	The loop should start from index 1 instead of 0.	The issue might be with the system's Java Runtime Environment (JRE) or Java Development Kit (JDK).
20	4	Hard	You have a method that should print the sum of all elements in an integer array. However, the method currently only prints the first element in the array.	public class BuggyCode {\n    public static void printArraySum(int[] arr) {\n        int sum = 0;\n        for (int i = 0; i < arr.length; i++) {\n            sum += arr[i];\n            System.out.println(sum);\n        }\n    }\n}	public class FixedCode {\n    public static void printArraySum(int[] arr) {\n        int sum = 0;\n        for (int i = 0; i < arr.length; i++) {\n            sum += arr[i];\n        }\n        System.out.println(sum);\n    }\n}	Replacing the addition operator += with a multiplication operator *= in the for loop.	Declaring the `sum` variable inside the for loop instead of before it.	Replacing the for loop with a while loop without changing anything else.
21	5	Easy	The following Java code is supposed to create an array of size 5 and fill it with the numbers 1 to 5. But it always throws an ArrayIndexOutOfBoundsException after printing the first element 1.	int[] myArray = new int[5];\nfor (int i = 1; i <= 5; i++) {\n  myArray[i] = i;\n  System.out.println(myArray[i]);\n}	int[] myArray = new int[5];\nfor (int i = 0; i < 5; i++) {\n  myArray[i] = i+1;\n  System.out.println(myArray[i]);\n}	The size of the array should be 6 instead of 5.	You should start the for loop from 2 instead of 1.	The print statement should be outside the for loop.
22	5	Easy	Given a simple Java program for printing all the elements of an array, the program doesn't run as expected and throws an ArrayIndexOutOfBoundsException.	public class Main {\n    public static void main(String[] args) {\n        int[] arr = {10, 20, 30, 40, 50};\n        for(int i=0; i<=arr.length; i++) {\n            System.out.println(arr[i]);\n        }\n    }\n}	public class Main {\n    public static void main(String[] args) {\n        int[] arr = {10, 20, 30, 40, 50};\n        for(int i=0; i<arr.length; i++) {\n            System.out.println(arr[i]);\n        }\n    }\n}	Changing arr.length to arr.size() in the for loop's condition	Changing arr[i] to arr.get(i) inside the System.out.println statement	Initializing i as 1 inside the for loop instead of 0
23	5	Medium	You have a simple Java program that counts the number of words in a given sentence. However, it is not providing the correct count.	public class WordCount {\n    public static void main(String[] args) {\n        String sentence = "Java is fun!";\n        System.out.println("Number of words: " + countWords(sentence));\n    }\n\n    public static int countWords(String sentence) {\n        return sentence.split(" ").length - 1;\n    }\n}	public class WordCount {\n    public static void main(String[] args) {\n        String sentence = "Java is fun!";\n        System.out.println("Number of words: " + countWords(sentence));\n    }\n\n    public static int countWords(String sentence) {\n        return sentence.split(" ").length;\n    }\n}	The split method should be replaced by the split("\\\\s") method.	The -1 at the end of the countWords method is not needed, but the sentence variable in the main method needs to have .trim() added to remove any possible extra spaces.	The split method is correct but it should be calling the trim() method before calling length().
24	5	Hard	A java application is supposed to process an XML file in a given format and extract information. But the application is throwing a NullPointerException while executing.	import javax.xml.parsers.*;\nimport org.w3c.dom.*;\n\npublic class XMLProcessor {\n\n    Document document;\n\n    public void loadXML(String xmlPath) {\n        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();\n        try {\n            DocumentBuilder builder = factory.newDocumentBuilder();\n            document = builder.parse(xmlPath);  \n        } catch (Exception ex) {\n            ex.printStackTrace();\n        }\n    }\n\n    public String getData() {\n        Element rootElement = document.getDocumentElement();\n        return rootElement.getAttribute("data");\n    }\n\n    public static void main(String args[]) {\n        XMLProcessor processor = new XMLProcessor();\n        processor.getData();\n        System.out.println(processor.getData());\n    }\n}	import javax.xml.parsers.*;\nimport org.w3c.dom.*;\n\npublic class XMLProcessor {\n\n    Document document;\n\n    public void loadXML(String xmlPath) {\n        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();\n        try {\n            DocumentBuilder builder = factory.newDocumentBuilder();\n            document = builder.parse(xmlPath);  \n        } catch (Exception ex) {\n            ex.printStackTrace();\n        }\n    }\n\n    public String getData() {\n        Element rootElement = document.getDocumentElement();\n        return rootElement.getAttribute("data");\n    }\n\n    public static void main(String args[]) {\n        XMLProcessor processor = new XMLProcessor();\n        processor.loadXML("path_to_your_xml_file");\n        System.out.println(processor.getData());\n    }\n}	The problem is with XMLParser, It is failing to parse the XML document.	The issue is with the method getDocumentElement(), This method is causing NullPointerException.	The problem is with JVM, the XML file is trying to read some data from JVM memory and is getting the NullPointerException.
25	5	Hard	You are provided with a class 'Calculator' which is supposed to perform simple arithmetic operations addition, subtraction, multiplication and division. Currently, the addition and subtraction methods are working properly but the multiplication and division methods are incorrectly implementd resulting into erroneous return values. Identify the erroneous code lines and provide the correct ones.	class Calculator{\n  int add(int num1, int num2){\n    return num1 + num2;\n  }\n  int subtract(int num1, int num2){\n    return num1 - num2;\n  }\n  int multiply(int num1, int num2){\n    return num1 + num2;\n  }\n  double divide(int num1, int num2){\n    if (num2 != 0){\n        return num1 + num2;\n    } else {\n        return 0;\n    }\n  }\n}	class Calculator {\n  int add(int num1, int num2) {\n    return num1 + num2;\n  }\n  int subtract(int num1, int num2) {\n    return num1 - num2;\n  }\n  int multiply(int num1, int num2) {\n    return num1 * num2;\n  }\n  double divide(int num1, int num2) {\n    if (num2 != 0) {\n        return (double) num1 / num2;\n    } else {\n        return 0;\n    }\n  }\n}	There's bug in the 'add' and 'subtract' methods, they are using wrong operator for their respective operations.	The bug is in the 'divide' method, it should check if the denominator 'num2' is 1 instead of 0.	The entire class 'Calculator' needs to be rewritten because it's not possible to perform arithmetic operations through methods.
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (userid, username, email, streakcounter, points, challengescompleted, last_activity_date) FROM stdin;
1	Lorenzo Cagliero	lc2583@princeton.edu	2	120	12	2025-03-22
\.


--
-- Name: problems_problemid_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.problems_problemid_seq', 25, true);


--
-- Name: users_userid_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_userid_seq', 1, true);


--
-- Name: problems problems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_pkey PRIMARY KEY (problemid);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);


--
-- PostgreSQL database dump complete
--


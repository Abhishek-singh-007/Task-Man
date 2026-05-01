import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const handleRegister = async (data) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/user/register`,
        data,
      );

      toast.success("Signup successful");
      navigate("/log-in");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(handleRegister)}
        className="bg-white p-8 rounded shadow-md w-[350px]"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Signup</h2>

        <input
          placeholder="Name"
          className="border p-2 w-full mb-2"
          {...register("name", { required: "Name required" })}
        />
        <p className="text-red-500 text-sm">{errors.name?.message}</p>

        <input
          placeholder="Email"
          className="border p-2 w-full mb-2"
          {...register("email", { required: "Email required" })}
        />
        <p className="text-red-500 text-sm">{errors.email?.message}</p>

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4"
          {...register("password", { required: "Password required" })}
        />
        <p className="text-red-500 text-sm">{errors.password?.message}</p>

        <button className="bg-blue-600 text-white w-full p-2 rounded">
          Signup
        </button>
      </form>
    </div>
  );
};

export default Register;

import axios from "axios";
import { mapFormToPrescriptionData } from "./prescriptionUtils";

export const aiOnImage = async (base64: string) => {
  const response = await axios.post(
    "https://medicineschedulerai.onrender.com/generate/image",
    {
      imageBase64: base64,
    }
  );
  const responseData = JSON.parse(
    response.data.response.replace(/```json|```/g, "").trim()
  );
  return mapFormToPrescriptionData(responseData);
};

export const aiOnText = async (prescriptionData: string) =>
  await axios.post(
    "https://medicineschedulerai.onrender.com/generate/textinput",
    { data: prescriptionData }
  );

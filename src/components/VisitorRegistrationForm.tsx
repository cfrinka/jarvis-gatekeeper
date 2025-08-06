import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { visitorService } from "../services/visitors";
import { useAuth } from "./AuthProvider";

const visitorSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z
    .string()
    .refine((value) => {

      const numericCPF = value.replace(/\D/g, '');
      return numericCPF.length === 11;
    }, "CPF deve ter 11 dígitos válidos"),
  destination: z.string().min(1, "Sala destino é obrigatória"),
  dateOfBirth: z.string().optional(),
  email: z.string().email({ message: "E-mail inválido" }).or(z.literal("")),
});

type VisitorFormData = z.infer<typeof visitorSchema>;

export default function VisitorRegistrationForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingCPF, setLoadingCPF] = useState(false);
  const [hasRegistration, setHasRegistration] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<VisitorFormData>({
    resolver: zodResolver(visitorSchema),
  });

  const cpf = watch("cpf");


  useEffect(() => {
    const checkCPFAndAutoFill = async () => {
      if (!cpf) {
        setHasRegistration(false);
        return;
      }

      const cleanCPF = removeCPFMask(cpf);
      

      if (cleanCPF.length === 11) {
        setLoadingCPF(true);
        setError(null);
        
        try {
          const existingVisitor = await visitorService.findVisitorByCPF(cleanCPF);
          
          if (existingVisitor) {

            console.log('Auto-filling visitor data:', existingVisitor);
            setValue("name", existingVisitor.name);
            setValue("email", existingVisitor.email || "");
            setValue("dateOfBirth", existingVisitor.dateOfBirth || "");
            console.log('Date of birth from DB:', existingVisitor.dateOfBirth);

            setHasRegistration(true);
          } else {
            setHasRegistration(false);
          }
        } catch (error) {
          console.error('Error checking CPF:', error);
          setError('Erro ao verificar CPF. Tente novamente.');
          setHasRegistration(false);
        } finally {
          setLoadingCPF(false);
        }
      } else {
        setHasRegistration(false);
      }
    };


    const timeoutId = setTimeout(checkCPFAndAutoFill, 500);
    
    return () => clearTimeout(timeoutId);
  }, [cpf, setValue]);


  const formatCPF = (value: string): string => {

    const numericValue = value.replace(/\D/g, '');
    

    if (numericValue.length <= 3) {
      return numericValue;
    } else if (numericValue.length <= 6) {
      return `${numericValue.slice(0, 3)}.${numericValue.slice(3)}`;
    } else if (numericValue.length <= 9) {
      return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6)}`;
    } else {
      return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6, 9)}-${numericValue.slice(9, 11)}`;
    }
  };


  const removeCPFMask = (value: string): string => {
    return value.replace(/\D/g, '');
  };


  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = formatCPF(e.target.value);
    setValue("cpf", maskedValue);
  };

  const onSubmit = async (data: VisitorFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      await visitorService.registerVisitor({
        name: data.name,
        cpf: removeCPFMask(data.cpf),
        email: data.email || '',
        dateOfBirth: data.dateOfBirth || null,
        room: data.destination,
        currentUserId: user?.id || null,
        currentUserName: user?.name || null,
      });


      reset();
      setHasRegistration(false);
      

      alert("Visitante registrado com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar visitante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100">    

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            CPF *
          </label>
          <div className="relative">
            <input
              {...register("cpf")}
              type="text"
              maxLength={14}
              onChange={handleCPFChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
              placeholder="123.456.789-01"
            />
            {loadingCPF && (
              <div className="absolute right-3 top-3">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          {errors.cpf && (
            <p className="text-red-600 text-sm mt-2 font-medium">{errors.cpf.message}</p>
          )}
          {hasRegistration && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Dados encontrados no sistema
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Nome Completo *
          </label>
          <input
            {...register("name")}
            type="text"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
            placeholder="Nome do visitante"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-2 font-medium">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
            placeholder="email@exemplo.com"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-2 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Data de Nascimento
          </label>
          <input
            {...register("dateOfBirth")}
            type="date"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Sala Destino *
          </label>
          <select
            {...register("destination")}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
          >
            <option value="">Selecione uma sala...</option>
            <option value="Sala Diamante">Sala Diamante</option>
            <option value="Sala Esmeralda">Sala Esmeralda</option>
            <option value="Sala Rubi">Sala Rubi</option>
            <option value="Sala Safira">Sala Safira</option>
            <option value="Sala Ametista">Sala Ametista</option>
          </select>
          {errors.destination && (
            <p className="text-red-600 text-sm mt-2 font-medium">
              {errors.destination.message}
            </p>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || loadingCPF}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registrando...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Registrar Visitante
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
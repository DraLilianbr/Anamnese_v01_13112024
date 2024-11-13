import { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { useBranding } from '../lib/branding';
import { resizeImage } from '../lib/image';

interface BrandingModalProps {
  open: boolean;
  onClose: () => void;
}

export function BrandingModal({ open, onClose }: BrandingModalProps) {
  const { companyName, logoUrl, updateBranding } = useBranding();
  const [name, setName] = useState(companyName);
  const [logo, setLogo] = useState(logoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState(logoUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo é muito grande. Por favor, selecione uma imagem menor que 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const resizedImageUrl = await resizeImage(file);
      setLogo(resizedImageUrl);
      setPreviewUrl(resizedImageUrl);
    } catch (error) {
      console.error('Error resizing image:', error);
      alert('Erro ao processar a imagem. Por favor, tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding(name, logo);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1594a4]">Configurações da Marca</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#1594a4]">Nome da Empresa</label>
              <input
                type="text"
                required
                className="mt-1 block w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da sua empresa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1594a4] mb-2">Logo da Empresa</label>
              
              {/* Preview Area */}
              <div className="mb-4 flex justify-center">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Logo preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2" />
                      <span className="text-sm">Nenhuma imagem</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Button */}
              <div className="flex justify-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1594a4]"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {previewUrl ? 'Trocar Logo' : 'Carregar Logo'}
                    </>
                  )}
                </button>
              </div>

              <p className="mt-2 text-sm text-gray-500 text-center">
                Tamanho máximo: 5MB. A imagem será redimensionada para 500x500px mantendo a proporção.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
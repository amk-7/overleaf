import { useProjectContext } from '../../../shared/context/project-context'
import { BinaryFile } from '@/features/file-view/types/binary-file'

export default function FileViewImage({
  file,
  onLoad,
  onError,
}: {
  file: BinaryFile
  onLoad: () => void
  onError: () => void
}) {
  const { _id: projectId } = useProjectContext()

  return (
    <img
      src={`/project/${projectId}/blob/${file.hash}?fallback=${file.id}`}
      onLoad={onLoad}
      onError={onError}
      alt={file.name}
    />
  )
}

namespace CalculateFunding.Frontend.Extensions
{
    using System.Threading.Tasks;

    public static class TaskHelper
    {
        public static async Task WhenAllAndThrow(params Task[] tasks)
        {
            await Task.WhenAll(tasks);
            if (tasks != null)
            {
                foreach (Task task in tasks)
                {
                    if (task.Exception != null)
                    {
                        throw task.Exception;
                    }
                }
            }
        }
    }
}

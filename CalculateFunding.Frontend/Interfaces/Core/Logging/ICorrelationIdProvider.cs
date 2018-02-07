namespace CalculateFunding.Frontend.Interfaces.Core.Logging
{
    public interface ICorrelationIdProvider
    {
        string GetCorrelationId();

        void SetCorrelationId(string correlationId);
    }
}
